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
        var assessmentIds = assessments.Values.Select(a => a.Id).ToList();
        var domainResults = await LoadDomainResultsAsync(assessmentIds);

        var rows = employees.Select(e =>
        {
            var assessment = assessments.GetValueOrDefault(e.Id);
            int? choiceScore = assessment?.ChoiceScore;
            int? choiceTotal = assessment?.ChoiceTotal;
            List<short>? suggestedLevels = null;
            if (assessment != null && domainResults.TryGetValue(assessment.Id, out var dList))
            {
                choiceScore ??= dList.Sum(d => d.BasicCorrect + d.IntermediateCorrect + d.AdvancedCorrect);
                choiceTotal ??= dList.Sum(d => d.BasicTotal + d.IntermediateTotal + d.AdvancedTotal);
                suggestedLevels = dList.Select(d => d.SuggestedLevel).ToList();
            }
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
                ChoiceScore = choiceScore,
                ChoiceTotal = choiceTotal,
                SuggestedLevels = suggestedLevels,
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

        var categoryIds = domains.Select(d => d.CategoryId).ToList();
        var ceilingRows = await _context.CapabilityCeilings.AsNoTracking()
            .Where(c => c.OrganizationId == trial.OrganizationId && categoryIds.Contains(c.CompetencyCategoryId))
            .ToListAsync();
        var orgCeilings = ceilingRows.Where(c => c.DepartmentId == null)
            .ToDictionary(c => c.CompetencyCategoryId, c => (int)c.CeilingLevel);
        var deptCeilingsMap = ceilingRows.Where(c => c.DepartmentId != null)
            .GroupBy(c => c.DepartmentId!.Value)
            .ToDictionary(g => g.Key, g => g.ToDictionary(c => c.CompetencyCategoryId, c => (int)c.CeilingLevel));

        var employees = reviewed
            .Select(r =>
            {
                var byCategory = (results.GetValueOrDefault(r.Id) ?? new List<TrialAssessmentDomain>()).ToDictionary(d => d.CategoryId);
                Dictionary<Guid, int>? deptCeilings = null;
                if (r.DepartmentId != Guid.Empty)
                {
                    deptCeilingsMap.TryGetValue(r.DepartmentId, out deptCeilings);
                }
                var domainDetails = domains.Select(domain =>
                {
                    byCategory.TryGetValue(domain.CategoryId, out var dResult);
                    var lvl = (int)(dResult?.MentorLevel ?? dResult?.SuggestedLevel ?? 0);
                    var targetLevel = deptCeilings != null && deptCeilings.TryGetValue(domain.CategoryId, out var dl) && dl > 0
                        ? dl
                        : orgCeilings.TryGetValue(domain.CategoryId, out var ol) && ol > 0 ? ol : 3;
                    var (levelLabel, statusText, gapText, recCourse) = DescribeDomainResult(domain.Number, domain.Name, lvl, targetLevel, dResult);

                    return new TrialReportEmployeeDomainDetailDto
                    {
                        CategoryId = domain.CategoryId,
                        Number = domain.Number,
                        Name = domain.Name,
                        Level = lvl,
                        TargetLevel = targetLevel,
                        SkillGap = Math.Max(0, targetLevel - lvl),
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
            var targetLevel = orgCeilings.TryGetValue(domain.CategoryId, out var ol) && ol > 0 ? ol : 3;
            var average = levels.Count == 0 ? 0m : Math.Round((decimal)levels.Average(), 1, MidpointRounding.AwayFromZero);
            var generalLevel = (int)Math.Round(average, MidpointRounding.AwayFromZero);
            var metCount = employees.Count(e => e.Levels[index] >= targetLevel);
            var targetMetRate = employees.Count == 0 ? 0m : Math.Round((decimal)metCount / employees.Count * 100m, 1);
            var avgGap = employees.Count == 0 ? 0m : Math.Round((decimal)employees.Select(e => Math.Max(0, targetLevel - e.Levels[index])).Average(), 1);
            var (statusText, gapSummary) = DescribeEnterpriseDomainSummary(domain.Number, domain.Name, generalLevel, targetLevel, targetMetRate);

            return new TrialReportDomainDto
            {
                CategoryId = domain.CategoryId,
                Number = domain.Number,
                Name = domain.Name,
                Counts = Enumerable.Range(0, 4).Select(level => levels.Count(l => l == level)).ToList(),
                Average = average,
                Level = generalLevel,
                TargetLevel = targetLevel,
                TargetMetRate = targetMetRate,
                AverageGap = avgGap,
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
        => DescribeDomainResult(domainNumber, domainName, level, 3, dResult);

    public static (string LevelLabel, string StatusText, string GapText, string RecommendedCourse) DescribeDomainResult(
        int domainNumber, string domainName, int level, int targetLevel, TrialAssessmentDomain? dResult)
    {
        targetLevel = Math.Clamp(targetLevel, 1, 3);
        var gap = Math.Max(0, targetLevel - level);
        var basicInfo = dResult != null ? $" (đúng {dResult.BasicCorrect}/{dResult.BasicTotal} câu)" : "";
        var interInfo = dResult != null ? $" (đúng {dResult.IntermediateCorrect}/{dResult.IntermediateTotal} câu)" : "";
        var advInfo = dResult != null ? $" (đúng {dResult.AdvancedCorrect}/{dResult.AdvancedTotal} câu)" : "";

        var levelLabel = level switch
        {
            0 => "Chưa đạt",
            1 => "Cơ bản",
            2 => "Trung cấp",
            _ => "Nâng cao"
        };

        var targetLabel = targetLevel switch
        {
            1 => "Cơ bản",
            2 => "Trung cấp",
            _ => "Nâng cao"
        };

        if (gap == 0)
        {
            var status = level > targetLevel ? "Vượt trần mục tiêu" : "Đạt trần mục tiêu";
            return (levelLabel,
                status,
                $"Đã đạt năng lực theo trần doanh nghiệp (Mức {levelLabel} / Trần {targetLabel}). Không có khoảng cách năng lực (Skill Gap: 0). Toàn bộ nội dung tương ứng đã được công nhận.",
                string.Empty);
        }

        var nextTier = level + 1;
        var nextCourse = nextTier switch
        {
            1 => $"M{domainNumber}-F: Khóa Cơ bản về {domainName}",
            2 => $"M{domainNumber}-I: Khóa Trung cấp về {domainName}",
            _ => $"M{domainNumber}-A: Khóa Nâng cao về {domainName}"
        };

        var gapDesc = level == 0
            ? $"Chưa đạt trắc nghiệm cấp Cơ bản{basicInfo}. Để đạt trần doanh nghiệp ({targetLabel}), bạn cần bắt đầu từ khóa Cơ bản."
            : $"Đã đạt cấp {levelLabel}, nhưng chưa đạt trần doanh nghiệp ({targetLabel}). Khoảng cách năng lực: Thiếu {gap} cấp độ. Cần hoàn thành khóa {nextTier switch { 1 => "Cơ bản", 2 => "Trung cấp", _ => "Nâng cao" }} để nâng cao năng lực theo mục tiêu doanh nghiệp.";

        return (levelLabel,
            $"Thiếu hụt {gap} cấp độ (Hiện tại: {levelLabel} · Trần DN: {targetLabel})",
            gapDesc,
            nextCourse);
    }

    private static (string StatusText, string GapSummary) DescribeEnterpriseDomainSummary(
        int domainNumber, string domainName, int generalLevel, int targetLevel, decimal targetMetRate)
    {
        targetLevel = Math.Clamp(targetLevel, 1, 3);
        var targetLabel = targetLevel switch { 1 => "Cơ bản", 2 => "Trung cấp", _ => "Nâng cao" };
        var generalLabel = generalLevel switch { 0 => "Chưa đạt Cơ bản", 1 => "Cơ bản", 2 => "Trung cấp", _ => "Nâng cao" };

        if (generalLevel >= targetLevel)
        {
            return ($"Đạt trần mục tiêu ({targetLabel})",
                $"Đội ngũ đã đạt hoặc vượt trần năng lực của doanh nghiệp (Hiện tại: {generalLabel} / Trần: {targetLabel}). Tỷ lệ nhân sự đạt chuẩn mục tiêu: {targetMetRate}%. Không có khoảng cách năng lực diện rộng cần bù đắp.");
        }

        var gap = targetLevel - generalLevel;
        var nextTier = generalLevel + 1;
        var recCourse = nextTier switch
        {
            1 => $"M{domainNumber}-F (Cơ bản)",
            2 => $"M{domainNumber}-I (Trung cấp)",
            _ => $"M{domainNumber}-A (Nâng cao)"
        };

        return ($"Thiếu {gap} cấp độ (Hiện tại: {generalLabel} · Trần: {targetLabel})",
            $"Đội ngũ hiện đạt mức {generalLabel}, thiếu hụt {gap} cấp so với trần doanh nghiệp ({targetLabel}). Tỷ lệ nhân sự đạt trần: {targetMetRate}%. Doanh nghiệp nên ưu tiên tổ chức đào tạo khóa {recCourse} về {domainName} để thu hẹp khoảng cách năng lực.");
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
    public int? ChoiceScore { get; set; }
    public int? ChoiceTotal { get; set; }
    public List<short>? SuggestedLevels { get; set; }
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
    public int TargetLevel { get; set; } = 3;
    public decimal TargetMetRate { get; set; }
    public decimal AverageGap { get; set; }
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
    public int TargetLevel { get; set; } = 3;
    public int SkillGap { get; set; }
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
