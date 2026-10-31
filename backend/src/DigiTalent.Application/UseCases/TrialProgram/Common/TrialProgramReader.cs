using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Đọc dữ liệu dùng chung của luồng dùng thử: doanh nghiệp dùng thử của người gọi (chủ doanh nghiệp hoặc mentor được phân
/// công), danh sách nhân viên tham gia kèm trạng thái bài làm, và bảng năng lực sau khi mentor chấm.
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

    /// <summary>Doanh nghiệp dùng thử được phân công cho mentor đang đăng nhập; không được phân công → 404.</summary>
    public async Task<TrialWorkspace> ForMentorAsync(Guid organizationId)
    {
        var userId = UserId;
        return await _context.TrialWorkspaces.FirstOrDefaultAsync(t => t.OrganizationId == organizationId && t.MentorUserId == userId)
               ?? throw new NotFoundException("Không tìm thấy doanh nghiệp được phân công cho bạn.");
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

    /// <summary>Vì sao nhân viên chưa vào phòng thi được lúc này (null = vào được).</summary>
    public static string? ClosedReason(TrialWorkspace trial, TrialAssessment? assessment, DateTimeOffset now)
    {
        if (assessment != null)
        {
            return "Bạn đã nộp bài đánh giá.";
        }

        // Đợt khảo sát ban đầu nếu chưa công bố và có đặt hạn chót
        if (trial.ReportPublishedAt == null && trial.TestDeadline.HasValue && now >= trial.TestDeadline.Value)
        {
            return "Đã quá hạn làm bài của đợt khảo sát.";
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
    /// bài đánh giá. Đã chấm → REVIEWED, đã nộp → SUBMITTED, đã kích hoạt → ACTIVE, lời mời → INVITED / INVITE_EXPIRED.
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
                Status = assessment?.ReviewedAt != null ? TrialProgramRules.ParticipantReviewed
                    : assessment != null ? TrialProgramRules.ParticipantSubmitted
                    : TrialProgramRules.ParticipantActive,
                AssessmentId = assessment?.Id,
                SubmittedAt = assessment?.SubmittedAt,
                ReviewedAt = assessment?.ReviewedAt,
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

    /// <summary>
    /// Bảng năng lực của doanh nghiệp từ các bài mentor đã chấm: mỗi lĩnh vực có số nhân viên ở từng mức (0..3), mức trung
    /// bình và mức chung (trung bình làm tròn); kèm mức từng nhân viên.
    /// </summary>
    public async Task<TrialReportDto> BuildReportAsync(TrialWorkspace trial)
    {
        var domains = await LoadDomainsAsync(trial.OrganizationId);
        var reviewed = await (
                from assessment in _context.TrialAssessments.AsNoTracking()
                join employee in _context.Employees.AsNoTracking() on assessment.EmployeeId equals employee.Id
                join user in _context.Users.AsNoTracking() on employee.UserId equals user.Id
                where assessment.OrganizationId == trial.OrganizationId && assessment.ReviewedAt != null
                select new
                {
                    assessment.Id,
                    EmployeeId = employee.Id,
                    employee.FullName,
                    user.Email,
                    employee.DepartmentId,
                    employee.JobPositionId,
                    assessment.ChoiceScore,
                    assessment.ChoiceTotal,
                    assessment.EssayBasicScore,
                    assessment.EssayIntermediateScore,
                    assessment.EssayAdvancedScore,
                    assessment.ReviewNote,
                    assessment.SubmittedAt,
                    assessment.ReviewedAt,
                })
            .ToListAsync();
        var results = await LoadDomainResultsAsync(reviewed.Select(r => r.Id).ToList());
        var departmentIds = reviewed.Select(r => r.DepartmentId).Distinct().ToList();
        var positionIds = reviewed.Where(r => r.JobPositionId.HasValue).Select(r => r.JobPositionId!.Value).Distinct().ToList();
        var departments = await _context.Departments.AsNoTracking().Where(d => departmentIds.Contains(d.Id)).ToDictionaryAsync(d => d.Id, d => d.Name);
        var positions = await _context.JobPositions.AsNoTracking().Where(p => positionIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name);

        var employees = reviewed
            .Select(r =>
            {
                var byCategory = (results.GetValueOrDefault(r.Id) ?? new List<TrialAssessmentDomain>()).ToDictionary(d => d.CategoryId);
                var domainDetails = domains.Select(domain =>
                {
                    byCategory.TryGetValue(domain.CategoryId, out var dResult);
                    var lvl = (int)(dResult?.MentorLevel ?? dResult?.SuggestedLevel ?? 0);
                    var (levelLabel, statusText, gapText, recCourse) = DescribeDomainResult(domain.Number, domain.Name, lvl, dResult);

                    return new TrialReportEmployeeDomainDetailDto
                    {
                        CategoryId = domain.CategoryId,
                        Number = domain.Number,
                        Name = domain.Name,
                        Level = lvl,
                        LevelLabel = levelLabel,
                        StatusText = statusText,
                        GapText = gapText,
                        BasicCorrect = dResult?.BasicCorrect ?? 0,
                        BasicTotal = dResult?.BasicTotal ?? 0,
                        IntermediateCorrect = dResult?.IntermediateCorrect ?? 0,
                        IntermediateTotal = dResult?.IntermediateTotal ?? 0,
                        AdvancedCorrect = dResult?.AdvancedCorrect ?? 0,
                        AdvancedTotal = dResult?.AdvancedTotal ?? 0,
                        SuggestedLevel = dResult?.SuggestedLevel ?? 0,
                        MentorLevel = dResult?.MentorLevel,
                        RecommendedCourse = recCourse,
                    };
                }).ToList();

                return new TrialReportEmployeeDto
                {
                    EmployeeId = r.EmployeeId,
                    AssessmentId = r.Id,
                    FullName = r.FullName,
                    Email = r.Email,
                    DepartmentName = departments.GetValueOrDefault(r.DepartmentId),
                    PositionName = r.JobPositionId is { } p ? positions.GetValueOrDefault(p) : null,
                    Levels = domainDetails.Select(d => d.Level).ToList(),
                    ChoiceScore = r.ChoiceScore,
                    ChoiceTotal = r.ChoiceTotal,
                    EssayBasicScore = r.EssayBasicScore,
                    EssayIntermediateScore = r.EssayIntermediateScore,
                    EssayAdvancedScore = r.EssayAdvancedScore,
                    ReviewNote = r.ReviewNote,
                    SubmittedAt = r.SubmittedAt,
                    ReviewedAt = r.ReviewedAt,
                    DomainDetails = domainDetails,
                };
            })
            .OrderBy(e => e.DepartmentName).ThenBy(e => e.FullName)
            .ToList();

        var summary = domains.Select((domain, index) =>
        {
            var levels = employees.Select(e => e.Levels[index]).ToList();
            var average = levels.Count == 0 ? 0m : Math.Round((decimal)levels.Average(), 1, MidpointRounding.AwayFromZero);
            var generalLevel = (int)Math.Round(average, MidpointRounding.AwayFromZero);
            var (statusText, gapSummary) = DescribeEnterpriseDomainSummary(domain.Number, domain.Name, generalLevel);

            return new TrialReportDomainDto
            {
                CategoryId = domain.CategoryId,
                Number = domain.Number,
                Name = domain.Name,
                Counts = Enumerable.Range(0, 4).Select(level => levels.Count(l => l == level)).ToList(),
                Average = average,
                Level = generalLevel,
                StatusText = statusText,
                GapSummary = gapSummary,
            };
        }).ToList();

        return new TrialReportDto
        {
            PublishedAt = trial.ReportPublishedAt,
            Assessed = employees.Count,
            Domains = domains.Select(TrialDomainDto.From).ToList(),
            Summary = summary,
            Employees = employees,
        };
    }

    public static (string LevelLabel, string StatusText, string GapText, string RecommendedCourse) DescribeDomainResult(
        int domainNumber, string domainName, int level, TrialAssessmentDomain? dResult)
    {
        var basicInfo = dResult != null ? $" (đúng {dResult.BasicCorrect}/{dResult.BasicTotal} câu)" : "";
        var interInfo = dResult != null ? $" (đúng {dResult.IntermediateCorrect}/{dResult.IntermediateTotal} câu)" : "";
        var advInfo = dResult != null ? $" (đúng {dResult.AdvancedCorrect}/{dResult.AdvancedTotal} câu)" : "";

        return level switch
        {
            0 => ("Chưa đạt",
                "Chưa đạt mức Cơ bản",
                $"Chưa đạt trắc nghiệm cấp Cơ bản{basicInfo}. Cần đạt tối thiểu từ 2/3 câu đúng để công nhận đạt chuẩn Cơ bản. Hãy bổ sung kiến thức nhập môn và hoàn thành khóa Cơ bản.",
                $"M{domainNumber}-F: Khóa Cơ bản về {domainName}"),
            1 => ("Cơ bản",
                "Đạt Cơ bản · Chưa đạt Trung cấp",
                $"Đã nắm vững kỹ năng Cơ bản{basicInfo}, nhưng chưa đạt trắc nghiệm Trung cấp{interInfo} (yêu cầu từ 2/3 câu). Cần nâng cao kỹ năng xử lý độc lập và học khóa Trung cấp.",
                $"M{domainNumber}-I: Khóa Trung cấp về {domainName}"),
            2 => ("Trung cấp",
                "Đạt Trung cấp · Chưa đạt Nâng cao",
                $"Thành thạo ứng dụng ở mức Trung cấp{interInfo}, nhưng chưa đạt trắc nghiệm Nâng cao{advInfo} (yêu cầu từ 2/3 câu). Cần tối ưu quy trình và học khóa Nâng cao.",
                $"M{domainNumber}-A: Khóa Nâng cao về {domainName}"),
            _ => ("Nâng cao",
                "Đạt mức Nâng cao",
                $"Xuất sắc làm chủ toàn diện năng lực về {domainName}{advInfo}. Bạn đã được miễn học cả 3 cấp độ và đạt chuẩn tối đa của khung năng lực.",
                "Đã đạt mức tối đa của chuẩn khung năng lực"),
        };
    }

    private static (string StatusText, string GapSummary) DescribeEnterpriseDomainSummary(int domainNumber, string domainName, int generalLevel)
    {
        return generalLevel switch
        {
            0 => ("Chưa đạt Cơ bản",
                $"Đội ngũ chưa hoàn thiện kiến thức nền tảng về {domainName}. Cần ưu tiên học khóa Cơ bản (M{domainNumber}-F) để đồng bộ năng lực số ban đầu."),
            1 => ("Đạt Cơ bản · Chưa đạt Trung cấp",
                $"Đội ngũ đã nắm thao tác cơ bản nhưng đang thiếu hụt kỹ năng phân tích và phối hợp chuyên sâu ở mức Trung cấp (M{domainNumber}-I)."),
            2 => ("Đạt Trung cấp · Chưa đạt Nâng cao",
                $"Đội ngũ đáp ứng tốt công việc thường nhật, nhưng cần nâng cao năng lực tối ưu hóa, an toàn cấp cao và chiến lược ở mức Nâng cao (M{domainNumber}-A)."),
            _ => ("Đạt chuẩn Nâng cao",
                $"Đội ngũ đã xuất sắc làm chủ toàn diện các tiêu chuẩn và kỹ năng nâng cao trong lĩnh vực {domainName}."),
        };
    }

    /// <summary>Người nhận thông báo của nền tảng (quản trị nền tảng đang hoạt động).</summary>
    public async Task<List<Guid>> PlatformAdminUserIdsAsync() =>
        await (
                from userRole in _context.UserRoles.AsNoTracking()
                join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join user in _context.Users.AsNoTracking() on userRole.UserId equals user.Id
                where role.Code == Roles.PlatformAdmin && user.Status == Statuses.User.Active
                select user.Id)
            .Distinct()
            .ToListAsync();

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
    /// <summary>INVITED | INVITE_EXPIRED | ACTIVE | SUBMITTED | REVIEWED.</summary>
    public string Status { get; set; } = string.Empty;
    public Guid? AssessmentId { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset AddedAt { get; set; }
}

public class TrialReportDto
{
    public DateTimeOffset? PublishedAt { get; set; }
    public int Assessed { get; set; }
    public List<TrialDomainDto> Domains { get; set; } = new();
    public List<TrialReportDomainDto> Summary { get; set; } = new();
    public List<TrialReportEmployeeDto> Employees { get; set; } = new();
}

public class TrialReportDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Số nhân viên ở mức 0 (chưa đạt Cơ bản), 1, 2, 3.</summary>
    public List<int> Counts { get; set; } = new();
    public decimal Average { get; set; }
    public int Level { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string GapSummary { get; set; } = string.Empty;
}

public class TrialReportEmployeeDto
{
    public Guid EmployeeId { get; set; }
    public Guid? AssessmentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    /// <summary>Mức theo thứ tự <see cref="TrialReportDto.Domains"/>.</summary>
    public List<int> Levels { get; set; } = new();
    public int ChoiceScore { get; set; }
    public int ChoiceTotal { get; set; }
    public int? EssayBasicScore { get; set; }
    public int? EssayIntermediateScore { get; set; }
    public int? EssayAdvancedScore { get; set; }
    public string? ReviewNote { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public List<TrialReportEmployeeDomainDetailDto> DomainDetails { get; set; } = new();
}

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
