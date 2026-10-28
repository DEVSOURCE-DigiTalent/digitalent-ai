using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Một năng lực thành phần mà vị trí yêu cầu (bộ yêu cầu ACTIVE), mã theo Khung TT02 ("1.1").</summary>
public sealed record PulseCompetencyRequirement(string Code, string Name, int RequiredLevel, bool Core);

/// <summary>Một lĩnh vực năng lực (competency_categories có khóa PUBLISHED) với các mốc của nhân viên.</summary>
public sealed class PulseDomainState
{
    public Guid CategoryId { get; init; }
    public int Number { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    /// <summary>Mục tiêu vị trí (0 = vị trí không yêu cầu lĩnh vực).</summary>
    public int Target { get; init; }
    /// <summary>Trần năng lực doanh nghiệp đặt cho phòng ban của nhân viên (0..3).</summary>
    public int Ceiling { get; init; } = PulseRules.MaxLevel;
    /// <summary>Đỉnh lộ trình = min(mục tiêu, trần); 0 = lĩnh vực ngoài lộ trình.</summary>
    public int PathTop => Target == 0 ? 0 : Math.Min(Target, Ceiling);
    /// <summary>Mức đã xác nhận = max(cấp khóa được công nhận, minh chứng thực tế được duyệt).</summary>
    public int Verified { get; init; }
    public string Source { get; init; } = PulseLevelSource.None;
    public string Status { get; init; } = PulseDomainStatus.Pending;
    public int Gap => Status == PulseDomainStatus.Gap ? PathTop - Verified : 0;
    public IReadOnlyList<PulseCompetencyRequirement> Competencies { get; init; } = Array.Empty<PulseCompetencyRequirement>();
}

public sealed class PulseCourseRef
{
    public Guid CourseId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Purpose { get; init; }
    public int? EstimatedMinutes { get; init; }
    public int VersionNo { get; init; }
    public Guid CategoryId { get; init; }
    public int Tier { get; init; }
}

/// <summary>Trạng thái một khóa (lĩnh vực × cấp) đối với nhân viên.</summary>
public sealed class PulseCourseState
{
    public PulseCourseRef Course { get; init; } = null!;
    public PulseDomainState Domain { get; init; } = null!;
    /// <summary>PATH | OPTIONAL | ABOVE_CEILING | OUTSIDE_PATH — xem <see cref="PulseCourseZone"/>.</summary>
    public string Zone { get; init; } = PulseCourseZone.Path;
    public bool InPath => Zone == PulseCourseZone.Path;
    public string Access { get; init; } = PulseCourseAccess.FreeFull;
    public Enrollment? Enrollment { get; init; }
    public bool Approved { get; init; }
    /// <summary>PRE_ASSESSMENT | FINAL | LEGACY khi đã được công nhận.</summary>
    public string? ApprovedVia { get; init; }
    public bool PrereqApproved { get; init; }
    public CoursePreAssessment? PreAssessment { get; init; }
    public string PreStatus { get; init; } = PulsePreStatus.Locked;
    public string? BlockReason { get; init; }
    public bool CanWork => BlockReason == null;
    public string SlotStatus { get; init; } = PulseSlotStatus.AfterPriorLevel;
    public string FinalStatus { get; init; } = PulseFinalStatus.NotStarted;
    public IReadOnlyList<CourseFinalSubmission> Submissions { get; init; } = Array.Empty<CourseFinalSubmission>();
    public IReadOnlyList<PulseModuleInfo> Modules { get; init; } = Array.Empty<PulseModuleInfo>();
    public IReadOnlyDictionary<Guid, PulseModuleProgress>? Progress { get; init; }
    public int ModulesPassed => PulseModuleReader.CountPassed(Modules, Progress);
    public bool AllModulesPassed => Modules.Count > 0 && ModulesPassed == Modules.Count;
    public int ProgressPercent => PulseRules.ProgressPercent(Modules, Progress);
    /// <summary>Có thể bắt đầu bài đánh giá trước khi học ngay bây giờ.</summary>
    public bool CanStartPreAssessment => PreStatus == PulsePreStatus.Required;
    /// <summary>Có thể bắt đầu bài cuối khóa (có giám sát) ngay bây giờ.</summary>
    public bool CanStartFinal => CanWork && Enrollment != null && PulseRules.CanSubmitFinal(FinalStatus);
}

/// <summary>Người đánh giá quá trình học của nhân viên: quản lý phòng ban, hoặc chủ doanh nghiệp khi nhân viên là quản lý.</summary>
public sealed record PulseReviewerInfo(string Name, string Role);

/// <summary>Toàn bộ trạng thái học của một nhân viên — nguồn dữ liệu cho Hôm nay, Lộ trình, Thực hành và Hồ sơ.</summary>
public sealed class PulseLearnerSnapshot
{
    public Employee Employee { get; init; } = null!;
    public string? DepartmentName { get; init; }
    public string? PositionName { get; init; }
    public string? OrganizationName { get; init; }
    public bool HasPosition { get; init; }
    public PulseReviewerInfo? Reviewer { get; init; }
    public IReadOnlyList<PulseDomainState> Domains { get; init; } = Array.Empty<PulseDomainState>();
    public IReadOnlyList<PulseCourseState> Courses { get; init; } = Array.Empty<PulseCourseState>();

    public bool HasTargets => Domains.Any(d => d.PathTop > 0);

    public PulseCourseState? FindCourse(Guid courseId) => Courses.FirstOrDefault(c => c.Course.CourseId == courseId);

    public PulseCourseState? Slot(Guid categoryId, int tier) =>
        Courses.FirstOrDefault(c => c.Course.CategoryId == categoryId && c.Course.Tier == tier);

    /// <summary>
    /// Việc nên làm tiếp trên lộ trình, theo thứ tự: nộp bài cuối của khóa đã học xong, học tiếp khóa đang dở (bắt đầu
    /// sớm nhất trước), làm bài đánh giá trước khi học, rồi bắt đầu học khóa chưa đạt bài đánh giá. Chỉ khóa trong
    /// lộ trình (khóa tùy chọn không được nhắc).
    /// </summary>
    public IReadOnlyList<PulseCourseState> NextSteps(int count = 3)
    {
        static DateTimeOffset Started(PulseCourseState c) => c.Enrollment?.StartedAt ?? c.Enrollment?.CreatedAt ?? DateTimeOffset.MaxValue;
        var path = Courses.Where(c => c.InPath).ToList();
        return path.Where(c => c.SlotStatus == PulseSlotStatus.FinalReady).OrderBy(Started)
            .Concat(path.Where(c => c.SlotStatus == PulseSlotStatus.InProgress).OrderBy(Started))
            .Concat(path.Where(c => c.SlotStatus == PulseSlotStatus.PreAssessment).OrderBy(c => c.Domain.Number).ThenBy(c => c.Course.Tier))
            .Concat(path.Where(c => c.SlotStatus == PulseSlotStatus.ToLearn).OrderBy(c => c.Domain.Number).ThenBy(c => c.Course.Tier))
            .Take(count)
            .ToList();
    }

    public PulseCourseState? NextCourse() => NextSteps(1).FirstOrDefault();
}

/// <summary>
/// Dựng <see cref="PulseLearnerSnapshot"/> cho nhân viên đang đăng nhập:
///   - Lĩnh vực = competency_categories của tổ chức có khóa PUBLISHED; mỗi (lĩnh vực, cấp) một khóa (PulseCatalogReader).
///   - Mục tiêu vị trí = mức yêu cầu lớn nhất trong lĩnh vực của bộ yêu cầu ACTIVE; trần = trần hiệu lực của phòng ban
///     (CapabilityCeilingReader); lộ trình = Cơ bản → min(mục tiêu, trần).
///   - Khóa được công nhận = lượt học COMPLETED của bất kỳ phiên bản nào của mã khóa (bài cuối khóa được duyệt, bài đánh
///     giá trước khi học đạt, hoặc luồng học trước).
///   - Bài đánh giá trước khi học bắt buộc trước khi học một khóa chưa bắt đầu (một bài cho mỗi mã khóa).
/// </summary>
public class PulseLearnerReader
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly PulseModuleReader _modules;
    private readonly PulseCatalogReader _catalog;
    private readonly CapabilityCeilingReader _ceilings;
    private readonly TimeProvider _clock;

    public PulseLearnerReader(
        IApplicationDbContext context,
        MyEmployeeContext me,
        PulseModuleReader modules,
        PulseCatalogReader catalog,
        CapabilityCeilingReader ceilings,
        TimeProvider clock)
    {
        _context = context;
        _me = me;
        _modules = modules;
        _catalog = catalog;
        _ceilings = ceilings;
        _clock = clock;
    }

    public Task<Employee> GetEmployeeAsync() => _me.GetAsync();

    public DateTimeOffset Now => _clock.GetUtcNow();

    public async Task<PulseLearnerSnapshot> LoadAsync(bool includeContent = false)
    {
        var employee = await _me.GetAsync();
        return await LoadForAsync(employee, includeContent);
    }

    public async Task<PulseLearnerSnapshot> LoadForAsync(Employee employee, bool includeContent = false)
    {
        var organizationId = employee.OrganizationId;
        var names = await (
                from e in _context.Employees.AsNoTracking()
                join d in _context.Departments.AsNoTracking() on e.DepartmentId equals d.Id
                join o in _context.Organizations.AsNoTracking() on e.OrganizationId equals o.Id
                where e.Id == employee.Id
                select new
                {
                    DepartmentName = d.Name,
                    d.ManagerEmployeeId,
                    OrganizationName = o.Name,
                    PositionName = _context.JobPositions.Where(p => p.Id == e.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                })
            .FirstOrDefaultAsync();

        var courses = await _catalog.LoadAsync(organizationId);
        var categoryIds = courses.Select(c => c.CategoryId).Distinct().ToList();
        var categories = await _context.CompetencyCategories
            .AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new { c.Id, c.Code, c.Name })
            .ToListAsync();

        var requirements = await LoadRequirementsAsync(employee.JobPositionId);
        var targets = requirements
            .GroupBy(r => r.CategoryId)
            .ToDictionary(g => g.Key, g => Math.Clamp(g.Max(r => r.Requirement.RequiredLevel), 0, PulseRules.MaxLevel));
        var ceilings = await _ceilings.EffectiveForDepartmentAsync(organizationId, employee.DepartmentId, categoryIds);

        // Doanh nghiệp dùng thử (docs/specs/2026-10-27-enterprise-trial-assessment.md): chưa có lộ trình tới khi mentor công bố
        // bảng năng lực; sau đó mọi lĩnh vực mở học thử cấp Cơ bản, bài đánh giá tổng hợp thay cho bài đánh giá trước khi học.
        var trialPublished = await _context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.OrganizationId == organizationId && t.ConvertedAt == null)
            .Select(t => (bool?)(t.ReportPublishedAt != null))
            .FirstOrDefaultAsync();
        var trialBasic = trialPublished == true;
        if (trialPublished.HasValue)
        {
            targets = categoryIds.ToDictionary(id => id, _ => trialBasic ? 1 : 0);
            ceilings = categoryIds.ToDictionary(id => id, _ => 1);
        }
        var evidenceLevels = await LoadEvidenceLevelsAsync(employee.Id);

        // Lượt học của nhân viên theo mã khóa (mọi phiên bản), bỏ lượt đã hủy.
        var codes = courses.Select(c => c.Code).ToList();
        var enrollmentRows = await (
                from enrollment in _context.Enrollments.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employee.Id
                      && course.OrganizationId == organizationId
                      && codes.Contains(course.Code)
                      && enrollment.Status != Statuses.Enrollment.Cancelled
                select new { Enrollment = enrollment, course.Code })
            .ToListAsync();
        var approvedCodes = enrollmentRows
            .Where(r => r.Enrollment.Status == Statuses.Enrollment.Completed)
            .Select(r => r.Code)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var enrollmentByCode = enrollmentRows
            .GroupBy(r => r.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => g.OrderBy(r => r.Enrollment.Status == Statuses.Enrollment.Completed ? 1 : 0)
                    .ThenByDescending(r => r.Enrollment.CreatedAt)
                    .First().Enrollment,
                StringComparer.OrdinalIgnoreCase);

        // Display the same revision as the enrollment's modules/questions, rather than a new title with old lessons.
        var enrolledCourseIds = enrollmentByCode.Values.Select(e => e.CourseId).Distinct().ToList();
        var enrolledCourses = await _context.Courses.AsNoTracking().Where(c => enrolledCourseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);
        courses = courses.Select(course =>
        {
            var enrollment = enrollmentByCode.GetValueOrDefault(course.Code);
            if (enrollment == null || !enrolledCourses.TryGetValue(enrollment.CourseId, out var enrolled)) return course;
            return new PulseCourseRef
            {
                CourseId = enrolled.Id, Code = enrolled.Code, Title = enrolled.Title, Description = enrolled.Description,
                Purpose = enrolled.Purpose, EstimatedMinutes = enrolled.EstimatedDurationMinutes, VersionNo = enrolled.VersionNo,
                CategoryId = course.CategoryId, Tier = course.Tier,
            };
        }).ToList();
        var enrollmentIds = enrollmentByCode.Values.Select(e => e.Id).ToList();
        var submissions = await _context.CourseFinalSubmissions
            .AsNoTracking()
            .Where(s => enrollmentIds.Contains(s.EnrollmentId))
            .OrderBy(s => s.AttemptNo)
            .ToListAsync();
        var submissionsByEnrollment = submissions.GroupBy(s => s.EnrollmentId).ToDictionary(g => g.Key, g => (IReadOnlyList<CourseFinalSubmission>)g.ToList());

        // Bài đánh giá trước khi học theo mã khóa (một bài cho mỗi mã; bài mới nhất nếu có nhiều phiên bản).
        var preRows = await (
                from pre in _context.CoursePreAssessments.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on pre.CourseId equals course.Id
                where pre.EmployeeId == employee.Id && course.OrganizationId == organizationId
                select new { Pre = pre, course.Code })
            .ToListAsync();
        var preByCode = preRows
            .GroupBy(r => r.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.Pre.SubmittedAt).First().Pre, StringComparer.OrdinalIgnoreCase);

        var modulesByCourse = await _modules.LoadModulesAsync(courses.Select(c => c.CourseId).Concat(enrollmentByCode.Values.Select(e => e.CourseId)).Distinct().ToList(), includeContent);
        var progress = await _modules.LoadProgressAsync(
            enrollmentByCode.Values.Select(e => (e.Id, e.Status, e.CourseId)).ToList(),
            modulesByCourse);

        // Lĩnh vực: mức đã xác nhận = max(cấp khóa được công nhận, minh chứng thực tế).
        var approvedTierByCategory = courses
            .Where(c => approvedCodes.Contains(c.Code))
            .GroupBy(c => c.CategoryId)
            .ToDictionary(g => g.Key, g => g.Max(c => c.Tier));
        var requirementsByCategory = requirements
            .GroupBy(r => r.CategoryId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<PulseCompetencyRequirement>)g.Select(r => r.Requirement).OrderBy(r => r.Code, NaturalCode).ToList());
        var domains = categories.Select((category, index) =>
        {
            var target = targets.GetValueOrDefault(category.Id);
            var ceiling = ceilings.TryGetValue(category.Id, out var value) ? value : PulseRules.MaxLevel;
            var courseLevel = approvedTierByCategory.GetValueOrDefault(category.Id);
            var evidenceLevel = evidenceLevels.GetValueOrDefault(category.Id);
            var verified = Math.Max(courseLevel, evidenceLevel);
            var source = verified == 0 ? PulseLevelSource.None
                : courseLevel >= evidenceLevel ? PulseLevelSource.Course
                : PulseLevelSource.PracticalEvidence;
            var pathTop = target == 0 ? 0 : Math.Min(target, ceiling);
            var status = pathTop == 0 ? PulseDomainStatus.OutsidePath
                : verified >= pathTop ? PulseDomainStatus.Met
                : verified == 0 ? PulseDomainStatus.Pending
                : PulseDomainStatus.Gap;
            return new PulseDomainState
            {
                CategoryId = category.Id,
                Number = index + 1,
                Code = category.Code,
                Name = DisplayName(category.Name),
                Target = target,
                Ceiling = ceiling,
                Verified = verified,
                Source = source,
                Status = status,
                Competencies = requirementsByCategory.GetValueOrDefault(category.Id) ?? Array.Empty<PulseCompetencyRequirement>(),
            };
        }).ToList();

        var hasPosition = employee.JobPositionId.HasValue;
        var now = Now;
        var states = courses
            .Where(c => domains.Any(d => d.CategoryId == c.CategoryId))
            .Select(course =>
            {
                var domain = domains.First(d => d.CategoryId == course.CategoryId);
                var zone = PulseRules.ZoneOf(course.Tier, domain.Target, domain.Ceiling);
                var enrollment = enrollmentByCode.GetValueOrDefault(course.Code);
                var approved = approvedCodes.Contains(course.Code);
                var prior = courses.FirstOrDefault(c => c.CategoryId == course.CategoryId && c.Tier == course.Tier - 1);
                var prereqApproved = course.Tier == 1 || prior == null || approvedCodes.Contains(prior.Code);
                var pre = preByCode.GetValueOrDefault(course.Code);
                var courseSubmissions = enrollment != null
                    ? submissionsByEnrollment.GetValueOrDefault(enrollment.Id) ?? Array.Empty<CourseFinalSubmission>()
                    : Array.Empty<CourseFinalSubmission>();
                // Đã bắt đầu học trước khi có bài đánh giá (luồng cũ), hoặc sau khi bài đánh giá chưa đạt.
                var started = enrollment != null && (enrollment.Status != Statuses.Enrollment.NotStarted || courseSubmissions.Count > 0);
                var preStatus = pre != null
                    ? pre.Decision == null ? PulsePreStatus.Pending
                    : pre.Decision == Statuses.FinalSubmissionDecision.Passed ? PulsePreStatus.Passed
                    : PulsePreStatus.NotYet
                    : approved || started || (trialBasic && course.Tier == 1) ? PulsePreStatus.NotNeeded
                    : !hasPosition || zone is PulseCourseZone.OutsidePath or PulseCourseZone.AboveCeiling || !prereqApproved ? PulsePreStatus.Locked
                    : PulsePreStatus.Required;
                var access = course.Tier == 1 ? PulseCourseAccess.FreeFull
                    : enrollment != null ? PulseCourseAccess.SeatActive
                    : PulseCourseAccess.Preview;
                var block = !hasPosition ? PulseBlockReason.NoPosition
                    : zone == PulseCourseZone.OutsidePath ? PulseBlockReason.OutsidePath
                    : zone == PulseCourseZone.AboveCeiling ? PulseBlockReason.AboveCeiling
                    : !prereqApproved ? PulseBlockReason.PriorLevelRequired
                    : preStatus == PulsePreStatus.Required ? PulseBlockReason.PreAssessmentRequired
                    : preStatus == PulsePreStatus.Pending ? PulseBlockReason.PreAssessmentPending
                    : course.Tier > 1 && enrollment == null ? PulseBlockReason.SeatRequired
                    : null;
                var modules = enrollment != null
                    ? modulesByCourse.GetValueOrDefault(enrollment.CourseId) ?? new List<PulseModuleInfo>()
                    : modulesByCourse.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>();
                var moduleProgress = enrollment != null ? progress.GetValueOrDefault(enrollment.Id) : null;
                var allPassed = modules.Count > 0 && PulseModuleReader.CountPassed(modules, moduleProgress) == modules.Count;
                var finalStatus = PulseRules.FinalStatusOf(enrollment, courseSubmissions, allPassed, now);
                var approvedVia = !approved ? null
                    : pre?.Decision == Statuses.FinalSubmissionDecision.Passed ? PulseApprovedVia.PreAssessment
                    : courseSubmissions.Any(s => s.Decision == Statuses.FinalSubmissionDecision.Passed) ? PulseApprovedVia.Final
                    : PulseApprovedVia.Legacy;
                var slot = !hasPosition ? PulseSlotStatus.NoPosition
                    : approved ? PulseSlotStatus.Completed
                    : zone == PulseCourseZone.OutsidePath ? PulseSlotStatus.OutsidePath
                    : zone == PulseCourseZone.AboveCeiling ? PulseSlotStatus.AboveCeiling
                    : !prereqApproved ? PulseSlotStatus.AfterPriorLevel
                    : preStatus == PulsePreStatus.Required ? PulseSlotStatus.PreAssessment
                    : preStatus == PulsePreStatus.Pending ? PulseSlotStatus.PreReview
                    : finalStatus == PulseFinalStatus.Pending ? PulseSlotStatus.InReview
                    : finalStatus is PulseFinalStatus.Flagged or PulseFinalStatus.DeadlineMissed ? PulseSlotStatus.NeedsSupport
                    : finalStatus == PulseFinalStatus.RetryWait ? PulseSlotStatus.RetryWait
                    : enrollment != null && PulseRules.CanSubmitFinal(finalStatus) ? PulseSlotStatus.FinalReady
                    : course.Tier > 1 && enrollment == null ? PulseSlotStatus.SeatNeeded
                    : enrollment != null && enrollment.Status != Statuses.Enrollment.NotStarted ? PulseSlotStatus.InProgress
                    : PulseSlotStatus.ToLearn;
                return new PulseCourseState
                {
                    Course = course,
                    Domain = domain,
                    Zone = zone,
                    Access = access,
                    Enrollment = enrollment,
                    Approved = approved,
                    ApprovedVia = approvedVia,
                    PrereqApproved = prereqApproved,
                    PreAssessment = pre,
                    PreStatus = preStatus,
                    BlockReason = block,
                    SlotStatus = slot,
                    FinalStatus = finalStatus,
                    Submissions = courseSubmissions,
                    Modules = modules,
                    Progress = moduleProgress,
                };
            })
            .OrderBy(s => s.Domain.Number).ThenBy(s => s.Course.Tier)
            .ToList();

        return new PulseLearnerSnapshot
        {
            Employee = employee,
            DepartmentName = names?.DepartmentName,
            PositionName = names?.PositionName,
            OrganizationName = names?.OrganizationName,
            HasPosition = hasPosition,
            Reviewer = await LoadReviewerAsync(employee, names?.ManagerEmployeeId),
            Domains = domains,
            Courses = states,
        };
    }

    /// <summary>Tên lĩnh vực bỏ số thứ tự đầu dòng ("1. Khai thác…" → "Khai thác…"); FE tự đánh số.</summary>
    public static string DisplayName(string categoryName)
    {
        var trimmed = categoryName.Trim();
        var dot = trimmed.IndexOf(". ", StringComparison.Ordinal);
        return dot is > 0 and <= 3 && trimmed[..dot].All(char.IsDigit) ? trimmed[(dot + 2)..].Trim() : trimmed;
    }

    /// <summary>Mục tiêu theo lĩnh vực của vị trí: mức yêu cầu lớn nhất trong lĩnh vực (bộ yêu cầu ACTIVE).</summary>
    public async Task<Dictionary<Guid, int>> LoadTargetsAsync(Guid? jobPositionId) =>
        (await LoadRequirementsAsync(jobPositionId))
            .GroupBy(r => r.CategoryId)
            .ToDictionary(g => g.Key, g => Math.Clamp(g.Max(r => r.Requirement.RequiredLevel), 0, PulseRules.MaxLevel));

    /// <summary>Các năng lực vị trí yêu cầu (bộ ACTIVE), kèm mã theo Khung TT02 khi có ánh xạ.</summary>
    private async Task<List<(Guid CategoryId, PulseCompetencyRequirement Requirement)>> LoadRequirementsAsync(Guid? jobPositionId)
    {
        if (!jobPositionId.HasValue)
        {
            return new List<(Guid, PulseCompetencyRequirement)>();
        }

        var rows = await (
                from set in _context.PositionRequirementSets.AsNoTracking()
                join item in _context.PositionRequirementItems.AsNoTracking() on set.Id equals item.RequirementSetId
                join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                where set.JobPositionId == jobPositionId.Value && set.Status == Statuses.PositionRequirementSet.Active
                select new { CompetencyId = competency.Id, competency.CategoryId, competency.Code, competency.Name, item.RequiredLevel })
            .ToListAsync();
        if (rows.Count == 0)
        {
            return new List<(Guid, PulseCompetencyRequirement)>();
        }

        var competencyIds = rows.Select(r => r.CompetencyId).Distinct().ToList();
        var sourceCodes = await (
                from mapping in _context.CompetencyFrameworkMappings.AsNoTracking()
                join framework in _context.CompetencyFrameworks.AsNoTracking() on mapping.FrameworkId equals framework.Id
                where framework.Code == CompetencyFrameworks.Tt02.Code && competencyIds.Contains(mapping.CompetencyId)
                select new { mapping.CompetencyId, mapping.SourceCode })
            .ToListAsync();
        var sourceByCompetency = sourceCodes
            .GroupBy(s => s.CompetencyId)
            .ToDictionary(g => g.Key, g => g.First().SourceCode);

        return rows
            .GroupBy(r => r.CompetencyId)
            .Select(g =>
            {
                var row = g.OrderByDescending(r => r.RequiredLevel).First();
                var code = sourceByCompetency.GetValueOrDefault(row.CompetencyId) ?? row.Code;
                var level = Math.Clamp(row.RequiredLevel, 0, PulseRules.MaxLevel);
                return (row.CategoryId, new PulseCompetencyRequirement(code, row.Name, level, CompetencyFrameworks.Tt02.CoreCompetencyCodes.Contains(code)));
            })
            .Where(r => r.Item2.RequiredLevel > 0)
            .ToList();
    }

    /// <summary>
    /// Quản lý phòng ban của nhân viên chấm bài; nhân viên là quản lý phòng ban (hoặc phòng chưa có quản lý) thì chủ
    /// doanh nghiệp chấm (PulseReviewScope: không ai tự chấm bài của mình).
    /// </summary>
    private async Task<PulseReviewerInfo?> LoadReviewerAsync(Employee employee, Guid? managerEmployeeId)
    {
        // Doanh nghiệp dùng thử: mentor DigiTalent được phân công chấm mọi bài.
        var trial = await _context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.OrganizationId == employee.OrganizationId && t.ConvertedAt == null)
            .Select(t => new { t.MentorUserId, MentorName = _context.Users.Where(u => u.Id == t.MentorUserId).Select(u => u.DisplayName).FirstOrDefault() })
            .FirstOrDefaultAsync();
        if (trial != null)
        {
            return trial.MentorUserId == null ? null : new PulseReviewerInfo(trial.MentorName ?? "Mentor DigiTalent", "Mentor DigiTalent");
        }

        if (managerEmployeeId is { } managerId && managerId != employee.Id)
        {
            var manager = await _context.Employees.AsNoTracking()
                .Where(e => e.Id == managerId)
                .Select(e => new { e.FullName, e.UserId })
                .FirstOrDefaultAsync();
            if (manager != null && (manager.UserId == null || manager.UserId != employee.UserId))
            {
                return new PulseReviewerInfo(manager.FullName, "Quản lý phòng ban");
            }
        }

        var owner = await (
                from userRole in _context.UserRoles.AsNoTracking()
                join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join user in _context.Users.AsNoTracking() on userRole.UserId equals user.Id
                where role.Code == Roles.Owner && user.OrganizationId == employee.OrganizationId && user.Id != employee.UserId
                orderby user.CreatedAt
                select new
                {
                    user.DisplayName,
                    EmployeeName = _context.Employees.Where(e => e.UserId == user.Id).Select(e => e.FullName).FirstOrDefault(),
                })
            .FirstOrDefaultAsync();
        return owner == null ? null : new PulseReviewerInfo(owner.EmployeeName ?? owner.DisplayName, "Chủ doanh nghiệp");
    }

    /// <summary>Mức cao nhất được xác nhận qua nhiệm vụ thực tế do quản lý duyệt, theo lĩnh vực.</summary>
    private async Task<Dictionary<Guid, int>> LoadEvidenceLevelsAsync(Guid employeeId)
    {
        var rows = await (
                from evidence in _context.CompetencyEvidences.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on evidence.CompetencyId equals competency.Id
                where evidence.EmployeeId == employeeId
                      && evidence.SourceType == Statuses.EvidenceSourceType.PracticalTask
                      && evidence.Status == Statuses.EvidenceStatus.Confirmed
                      && evidence.IsLevelConfirming
                      && evidence.ConfirmedLevel != null
                select new { competency.CategoryId, Level = (int)evidence.ConfirmedLevel!.Value })
            .ToListAsync();

        return rows
            .GroupBy(r => r.CategoryId)
            .ToDictionary(g => g.Key, g => Math.Clamp(g.Max(r => r.Level), 0, PulseRules.MaxLevel));
    }

    /// <summary>So "1.10" sau "1.9": mã năng lực theo thứ tự số của từng phần.</summary>
    private static readonly IComparer<string> NaturalCode = Comparer<string>.Create((a, b) =>
    {
        var left = a.Split('.');
        var right = b.Split('.');
        for (var i = 0; i < Math.Min(left.Length, right.Length); i++)
        {
            var compared = int.TryParse(left[i], out var x) && int.TryParse(right[i], out var y)
                ? x.CompareTo(y)
                : string.CompareOrdinal(left[i], right[i]);
            if (compared != 0)
            {
                return compared;
            }
        }

        return left.Length.CompareTo(right.Length);
    });
}
