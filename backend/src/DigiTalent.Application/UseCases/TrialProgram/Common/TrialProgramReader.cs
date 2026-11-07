using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Đọc dữ liệu dùng chung của luồng dùng thử: doanh nghiệp dùng thử của người gọi (chủ doanh nghiệp hoặc nhân viên), danh
/// sách nhân viên tham gia kèm trạng thái bài làm và kết quả từng lĩnh vực. Báo cáo năng lực: <see cref="TrialReportBuilder"/>.
/// </summary>
public class TrialProgramReader
{
    public const string NotTrialMessage = "Doanh nghiệp này không ở chế độ dùng thử.";

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly TrialAssessmentPaper _paper;
    private readonly TimeProvider _clock;

    public TrialProgramReader(IApplicationDbContext context, ICurrentUser currentUser, TrialAssessmentPaper paper, TimeProvider clock)
    {
        _context = context;
        _currentUser = currentUser;
        _paper = paper;
        _clock = clock;
    }

    public DateTimeOffset Now => _clock.GetUtcNow();

    public Guid UserId => _currentUser.UserId ?? throw new ForbiddenException("Bạn cần đăng nhập.");

    /// <summary>Doanh nghiệp dùng thử của chủ doanh nghiệp đang đăng nhập.</summary>
    public async Task<TrialWorkspace> ForOwnerAsync()
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var trial = await _context.TrialWorkspaces.FirstOrDefaultAsync(t => t.OrganizationId == organizationId);
        if (trial == null)
        {
            var ownerUserId = _currentUser.UserId ?? Guid.Empty;
            trial = new TrialWorkspace
            {
                OrganizationId = organizationId,
                OwnerUserId = ownerUserId,
                StartedAt = Now,
                EndsAt = Now.AddDays(60),
            };
            _context.TrialWorkspaces.Add(trial);
            await _context.SaveChangesAsync();
        }
        return trial;
    }

    /// <summary>Doanh nghiệp dùng thử của nhân viên; tự động đảm bảo có không gian đánh giá cho tổ chức.</summary>
    public async Task<TrialWorkspace> ForEmployeeAsync(Employee employee)
    {
        var trial = await _context.TrialWorkspaces.FirstOrDefaultAsync(t => t.OrganizationId == employee.OrganizationId);
        if (trial == null)
        {
            trial = new TrialWorkspace
            {
                OrganizationId = employee.OrganizationId,
                OwnerUserId = Guid.Empty,
                StartedAt = Now,
                EndsAt = Now.AddDays(60),
            };
            _context.TrialWorkspaces.Add(trial);
            await _context.SaveChangesAsync();
        }
        return trial;
    }

    /// <summary>
    /// Vì sao nhân viên chưa vào phòng thi / chưa nộp được lúc <paramref name="at"/> (null = được). Lúc nộp bài,
    /// <paramref name="at"/> là giờ mở phiên: phiên mở trước khi bài đóng vẫn nộp được.
    /// </summary>
    public static string? ClosedReason(TrialWorkspace trial, TrialAssessment? assessment, DateTimeOffset at)
    {
        if (assessment != null)
        {
            return "Bạn đã nộp bài đánh giá.";
        }

        if (trial.ReportPublishedAt is { } closedAt && at >= closedAt)
        {
            return "Bài đánh giá đã đóng.";
        }

        if (trial.TestDeadline is { } deadline && at >= deadline)
        {
            return "Đã quá hạn làm bài.";
        }

        return null;
    }

    public Task<List<TrialDomainInfo>> LoadDomainsAsync(Guid organizationId) => _paper.LoadDomainsAsync(organizationId);

    public async Task<string> OrganizationNameAsync(Guid organizationId) =>
        await _context.Organizations.AsNoTracking().Where(o => o.Id == organizationId).Select(o => o.Name).FirstOrDefaultAsync() ?? string.Empty;

    public async Task<string?> UserNameAsync(Guid? userId) => userId is not { } id
        ? null
        : await _context.Users.AsNoTracking().Where(u => u.Id == id).Select(u => u.DisplayName).FirstOrDefaultAsync();

    /// <summary>
    /// Nhân viên tham gia: hồ sơ nhân viên của doanh nghiệp (chủ doanh nghiệp chỉ có khi chọn tự làm bài) và lời mời chưa kích hoạt, kèm trạng thái
    /// bài đánh giá. Đã nộp → SUBMITTED, đã kích hoạt → ACTIVE, lời mời → INVITED / INVITE_EXPIRED.
    /// </summary>
    public async Task<List<TrialParticipantDto>> LoadParticipantsAsync(TrialWorkspace trial)
    {
        var now = Now;
        var departments = await _context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == trial.OrganizationId)
            .ToDictionaryAsync(d => d.Id, d => d.Name);
        var positions = await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == trial.OrganizationId)
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var employees = await (
                from employee in _context.Employees.AsNoTracking()
                join user in _context.Users.AsNoTracking() on employee.UserId equals user.Id
                where employee.OrganizationId == trial.OrganizationId && employee.Status != Statuses.Employee.Archived
                select new { employee.Id, employee.UserId, employee.FullName, user.Email, employee.DepartmentId, employee.JobPositionId, employee.CreatedAt })
            .ToListAsync();
        var employeeIds = employees.Select(e => e.Id).ToList();
        var assessments = await _context.TrialAssessments.AsNoTracking()
            .Where(a => employeeIds.Contains(a.EmployeeId))
            .ToDictionaryAsync(a => a.EmployeeId);

        var rows = employees.Select(e =>
        {
            var assessment = assessments.GetValueOrDefault(e.Id);
            return new TrialParticipantDto
            {
                Id = e.Id,
                EmployeeId = e.Id,
                IsOwner = e.UserId == trial.OwnerUserId,
                FullName = e.FullName,
                Email = e.Email,
                DepartmentName = departments.GetValueOrDefault(e.DepartmentId),
                PositionName = e.JobPositionId is { } p ? positions.GetValueOrDefault(p) : null,
                Status = assessment != null ? TrialProgramRules.ParticipantSubmitted : TrialProgramRules.ParticipantActive,
                AssessmentId = assessment?.Id,
                SubmittedAt = assessment?.SubmittedAt,
                AddedAt = e.CreatedAt,
            };
        }).ToList();

        var invitations = await _context.MemberInvitations.AsNoTracking()
            .Where(i => i.OrganizationId == trial.OrganizationId && i.Status == Statuses.MemberInvitation.Pending)
            .ToListAsync();
        rows.AddRange(invitations.Select(i => new TrialParticipantDto
        {
            Id = i.Id,
            InvitationId = i.Id,
            FullName = i.FullName,
            Email = i.Email,
            DepartmentName = i.DepartmentId is { } d ? departments.GetValueOrDefault(d) : null,
            PositionName = i.JobPositionId is { } p ? positions.GetValueOrDefault(p) : null,
            Status = i.ExpiresAt > now ? TrialProgramRules.ParticipantInvited : TrialProgramRules.ParticipantInviteExpired,
            AddedAt = i.InvitedAt,
        }));

        return rows.OrderBy(r => r.DepartmentName).ThenBy(r => r.FullName).ToList();
    }

    /// <summary>Kết quả từng lĩnh vực của các bài làm, theo id bài làm (thứ tự lĩnh vực của khung).</summary>
    public async Task<Dictionary<Guid, List<TrialAssessmentDomain>>> LoadDomainResultsAsync(IReadOnlyCollection<Guid> assessmentIds)
    {
        if (assessmentIds.Count == 0)
        {
            return new Dictionary<Guid, List<TrialAssessmentDomain>>();
        }

        return (await _context.TrialAssessmentDomains.AsNoTracking()
                .Where(d => assessmentIds.Contains(d.TrialAssessmentId))
                .ToListAsync())
            .GroupBy(d => d.TrialAssessmentId)
            .ToDictionary(g => g.Key, g => g.ToList());
    }

    public static (string LevelLabel, string StatusText, string GapText, string RecommendedCourse) DescribeDomainResult(
        int domainNumber, string domainName, int level, TrialAssessmentDomain? dResult)
    {
        static string Info(short correct, short total) => total > 0 ? $" (đúng {correct}/{total} câu)" : "";
        static string Need(short total) => total > 0 ? $" (cần đúng {PulseRules.ChoicePassMark(total)}/{total} câu)" : "";
        var basicInfo = dResult != null ? Info(dResult.BasicCorrect, dResult.BasicTotal) : "";
        var interInfo = dResult != null ? Info(dResult.IntermediateCorrect, dResult.IntermediateTotal) : "";
        var advInfo = dResult != null ? Info(dResult.AdvancedCorrect, dResult.AdvancedTotal) : "";

        return level switch
        {
            0 => ("Chưa đạt",
                "Chưa đạt mức Cơ bản",
                $"Chưa đạt trắc nghiệm cấp Cơ bản{basicInfo}{(dResult != null ? Need(dResult.BasicTotal) : "")}. Hãy học khóa Cơ bản.",
                $"M{domainNumber}-F: Khóa Cơ bản về {domainName}"),
            1 => ("Cơ bản",
                "Đạt Cơ bản · Chưa đạt Trung cấp",
                $"Đạt Cơ bản{basicInfo}, chưa đạt Trung cấp{interInfo}{(dResult != null ? Need(dResult.IntermediateTotal) : "")}. Bước tiếp theo: khóa Trung cấp.",
                $"M{domainNumber}-I: Khóa Trung cấp về {domainName}"),
            2 => ("Trung cấp",
                "Đạt Trung cấp · Chưa đạt Nâng cao",
                $"Đạt Trung cấp{interInfo}, chưa đạt Nâng cao{advInfo}{(dResult != null ? Need(dResult.AdvancedTotal) : "")}. Bước tiếp theo: khóa Nâng cao.",
                $"M{domainNumber}-A: Khóa Nâng cao về {domainName}"),
            _ => ("Nâng cao",
                "Đạt mức Nâng cao",
                $"Xuất sắc làm chủ toàn diện năng lực về {domainName}{advInfo}. Bạn đã được miễn học cả 3 cấp độ và đạt chuẩn tối đa của khung năng lực.",
                "Đã đạt mức tối đa của chuẩn khung năng lực"),
        };
    }

    public void Notify(IEnumerable<Guid> recipients, string type, string title, string message, Guid organizationId)
    {
        foreach (var recipient in recipients.Distinct())
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = recipient,
                Type = type,
                Title = title,
                Message = message,
                RelatedEntityType = "trial_workspaces",
                RelatedEntityId = organizationId,
            });
        }
    }
}

public class TrialDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public static TrialDomainDto From(TrialDomainInfo domain) =>
        new() { CategoryId = domain.CategoryId, Number = domain.Number, Code = domain.Code, Name = domain.Name };
}

/// <summary>Một nhân viên tham gia dùng thử (hồ sơ đã kích hoạt hoặc lời mời đang chờ).</summary>
public class TrialParticipantDto
{
    public Guid Id { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid? InvitationId { get; set; }
    /// <summary>Chủ doanh nghiệp tự tham gia làm bài.</summary>
    public bool IsOwner { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    /// <summary>INVITED | INVITE_EXPIRED | ACTIVE | SUBMITTED.</summary>
    public string Status { get; set; } = string.Empty;
    public Guid? AssessmentId { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset AddedAt { get; set; }
}

/// <summary>Kết quả một lĩnh vực của một nhân viên (trang kết quả của nhân viên).</summary>
public class TrialReportEmployeeDomainDetailDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelLabel { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
    public string GapText { get; set; } = string.Empty;
    public int BasicCorrect { get; set; }
    public int BasicTotal { get; set; }
    public int IntermediateCorrect { get; set; }
    public int IntermediateTotal { get; set; }
    public int AdvancedCorrect { get; set; }
    public int AdvancedTotal { get; set; }
    public int SuggestedLevel { get; set; }
    public int? MentorLevel { get; set; }
    public string RecommendedCourse { get; set; } = string.Empty;
}
