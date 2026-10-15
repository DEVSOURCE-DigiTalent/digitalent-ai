using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Một lĩnh vực năng lực (competency_categories có khóa PUBLISHED) với các mốc của nhân viên.</summary>
public sealed class PulseDomainState
{
    public Guid CategoryId { get; init; }
    public int Number { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    /// <summary>Mục tiêu vị trí (0 = ngoài lộ trình).</summary>
    public int Target { get; init; }
    /// <summary>Mức đầu vào (null = chưa làm bài hoặc lĩnh vực ngoài bài đầu vào).</summary>
    public int? Baseline { get; init; }
    /// <summary>Mức đã xác nhận = max(đầu vào, cấp khóa được duyệt, minh chứng thực tế được duyệt).</summary>
    public int Verified { get; init; }
    public string Source { get; init; } = PulseLevelSource.Baseline;
    public string Status { get; init; } = PulseDomainStatus.Pending;
    public int Gap => Status == PulseDomainStatus.Gap ? Target - Verified : 0;
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
    public bool InPath { get; init; }
    public string Access { get; init; } = PulseCourseAccess.FreeFull;
    public Enrollment? Enrollment { get; init; }
    public bool Approved { get; init; }
    public bool PrereqApproved { get; init; }
    public string? BlockReason { get; init; }
    public bool CanWork => BlockReason == null;
    public string SlotStatus { get; init; } = PulseSlotStatus.FreeToStart;
    public string FinalStatus { get; init; } = PulseFinalStatus.NotStarted;
    public IReadOnlyList<CourseFinalSubmission> Submissions { get; init; } = Array.Empty<CourseFinalSubmission>();
    public IReadOnlyList<PulseModuleInfo> Modules { get; init; } = Array.Empty<PulseModuleInfo>();
    public IReadOnlyDictionary<Guid, PulseModuleProgress>? Progress { get; init; }
    public int ModulesPassed => PulseModuleReader.CountPassed(Modules, Progress);
    public bool AllModulesPassed => Modules.Count > 0 && ModulesPassed == Modules.Count;
}

/// <summary>Toàn bộ trạng thái học của một nhân viên — nguồn dữ liệu cho Hôm nay, Lộ trình, Thực hành và Hồ sơ.</summary>
public sealed class PulseLearnerSnapshot
{
    public Employee Employee { get; init; } = null!;
    public string? DepartmentName { get; init; }
    public string? PositionName { get; init; }
    public string? OrganizationName { get; init; }
    public bool HasPosition { get; init; }
    public bool Assessed { get; init; }
    public DateTimeOffset? AssessedAt { get; init; }
    public IReadOnlyList<PulseDomainState> Domains { get; init; } = Array.Empty<PulseDomainState>();
    public IReadOnlyList<PulseCourseState> Courses { get; init; } = Array.Empty<PulseCourseState>();

    public bool HasTargets => Domains.Any(d => d.Target > 0);

    public PulseCourseState? FindCourse(Guid courseId) => Courses.FirstOrDefault(c => c.Course.CourseId == courseId);

    public PulseCourseState? Slot(Guid categoryId, int tier) =>
        Courses.FirstOrDefault(c => c.Course.CategoryId == categoryId && c.Course.Tier == tier);

    /// <summary>
    /// Khóa nên học tiếp: khóa đang học dở trong lộ trình (bắt đầu sớm nhất); nếu không có thì theo lộ trình —
    /// ưu tiên lĩnh vực còn khoảng cách đã đo, rồi các lĩnh vực khác theo thứ tự, mỗi lĩnh vực từ cấp thấp lên,
    /// lấy khóa đầu tiên chưa được duyệt (flow-conformance.js recommended()).
    /// </summary>
    public PulseCourseState? NextCourse()
    {
        var learning = Courses
            .Where(c => c.InPath && c.CanWork && !c.Approved && c.Enrollment is { } e && e.Status != Statuses.Enrollment.Completed)
            .OrderBy(c => c.Enrollment!.StartedAt ?? c.Enrollment!.CreatedAt)
            .FirstOrDefault();
        if (learning != null)
        {
            return learning;
        }

        var inTarget = Domains.Where(d => d.Target > 0).ToList();
        var firstGap = inTarget.FirstOrDefault(d => d.Status == PulseDomainStatus.Gap);
        var ordered = firstGap == null ? inTarget : inTarget.Where(d => d != firstGap).Prepend(firstGap);
        foreach (var domain in ordered)
        {
            for (var tier = 1; tier <= domain.Target; tier++)
            {
                var slot = Slot(domain.CategoryId, tier);
                if (slot != null && !slot.Approved)
                {
                    return slot;
                }
            }
        }

        return null;
    }
}

/// <summary>
/// Dựng <see cref="PulseLearnerSnapshot"/> cho nhân viên đang đăng nhập (§7–§8):
///   - Lĩnh vực = competency_categories của tổ chức có khóa PUBLISHED; cấp khóa = target_level lớn nhất trong
///     course_competencies; mỗi (lĩnh vực, cấp) một khóa (bản mới nhất của mã khóa, mã nhỏ nhất nếu trùng ô).
///   - Mục tiêu vị trí = mức yêu cầu lớn nhất trong lĩnh vực của bộ yêu cầu ACTIVE của vị trí.
///   - Khóa được duyệt = lượt học COMPLETED của bất kỳ phiên bản nào của mã khóa.
/// </summary>
public class PulseLearnerReader
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly PulseModuleReader _modules;
    private readonly TimeProvider _clock;

    public PulseLearnerReader(IApplicationDbContext context, MyEmployeeContext me, PulseModuleReader modules, TimeProvider clock)
    {
        _context = context;
        _me = me;
        _modules = modules;
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
                    OrganizationName = o.Name,
                    PositionName = _context.JobPositions.Where(p => p.Id == e.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                })
            .FirstOrDefaultAsync();

        var courses = await LoadCatalogAsync(organizationId);
        var categoryIds = courses.Select(c => c.CategoryId).Distinct().ToList();
        var categories = await _context.CompetencyCategories
            .AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new { c.Id, c.Code, c.Name })
            .ToListAsync();

        var targets = await LoadTargetsAsync(employee.JobPositionId);
        var baselines = await _context.CapabilityBaselines
            .AsNoTracking()
            .Where(b => b.EmployeeId == employee.Id)
            .ToListAsync();
        var assessed = baselines.Count > 0;
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

        var enrollmentIds = enrollmentByCode.Values.Select(e => e.Id).ToList();
        var submissions = await _context.CourseFinalSubmissions
            .AsNoTracking()
            .Where(s => enrollmentIds.Contains(s.EnrollmentId))
            .OrderBy(s => s.AttemptNo)
            .ToListAsync();
        var submissionsByEnrollment = submissions.GroupBy(s => s.EnrollmentId).ToDictionary(g => g.Key, g => (IReadOnlyList<CourseFinalSubmission>)g.ToList());

        var modulesByCourse = await _modules.LoadModulesAsync(courses.Select(c => c.CourseId).Concat(enrollmentByCode.Values.Select(e => e.CourseId)).Distinct().ToList(), includeContent);
        var progress = await _modules.LoadProgressAsync(
            enrollmentByCode.Values.Select(e => (e.Id, e.Status, e.CourseId)).ToList(),
            modulesByCourse);

        // Lĩnh vực: mức đã xác nhận = max(đầu vào, cấp khóa được duyệt, minh chứng thực tế).
        var approvedTierByCategory = courses
            .Where(c => approvedCodes.Contains(c.Code))
            .GroupBy(c => c.CategoryId)
            .ToDictionary(g => g.Key, g => g.Max(c => c.Tier));
        var domains = categories.Select((category, index) =>
        {
            var target = targets.GetValueOrDefault(category.Id);
            int? baseline = baselines.FirstOrDefault(b => b.CompetencyCategoryId == category.Id)?.BaselineLevel;
            var courseLevel = approvedTierByCategory.GetValueOrDefault(category.Id);
            var evidenceLevel = evidenceLevels.GetValueOrDefault(category.Id);
            var verified = Math.Max(baseline ?? 0, Math.Max(courseLevel, evidenceLevel));
            var source = courseLevel >= verified && courseLevel > (baseline ?? 0) ? PulseLevelSource.Course
                : evidenceLevel >= verified && evidenceLevel > (baseline ?? 0) ? PulseLevelSource.PracticalEvidence
                : PulseLevelSource.Baseline;
            var status = target == 0 ? PulseDomainStatus.OutsidePath
                : !assessed || verified == 0 ? PulseDomainStatus.Pending
                : verified >= target ? PulseDomainStatus.Met
                : PulseDomainStatus.Gap;
            return new PulseDomainState
            {
                CategoryId = category.Id,
                Number = index + 1,
                Code = category.Code,
                Name = DisplayName(category.Name),
                Target = target,
                Baseline = assessed ? baseline : null,
                Verified = assessed ? verified : 0,
                Source = source,
                Status = status,
            };
        }).ToList();

        var hasPosition = employee.JobPositionId.HasValue;
        var now = Now;
        var states = courses
            .Where(c => domains.Any(d => d.CategoryId == c.CategoryId))
            .Select(course =>
            {
                var domain = domains.First(d => d.CategoryId == course.CategoryId);
                var enrollment = enrollmentByCode.GetValueOrDefault(course.Code);
                var approved = approvedCodes.Contains(course.Code);
                var prior = courses.FirstOrDefault(c => c.CategoryId == course.CategoryId && c.Tier == course.Tier - 1);
                var prereqApproved = course.Tier == 1 || prior == null || approvedCodes.Contains(prior.Code);
                var inPath = domain.Target >= course.Tier;
                var access = course.Tier == 1 ? PulseCourseAccess.FreeFull
                    : enrollment != null ? PulseCourseAccess.SeatActive
                    : PulseCourseAccess.Preview;
                var block = !hasPosition ? PulseBlockReason.NoPosition
                    : !assessed ? PulseBlockReason.NotAssessed
                    : !inPath ? PulseBlockReason.OutsidePath
                    : course.Tier > 1 && enrollment == null ? PulseBlockReason.SeatRequired
                    : !prereqApproved ? PulseBlockReason.PriorLevelRequired
                    : null;
                var modules = enrollment != null
                    ? modulesByCourse.GetValueOrDefault(enrollment.CourseId) ?? new List<PulseModuleInfo>()
                    : modulesByCourse.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>();
                var moduleProgress = enrollment != null ? progress.GetValueOrDefault(enrollment.Id) : null;
                var courseSubmissions = enrollment != null
                    ? submissionsByEnrollment.GetValueOrDefault(enrollment.Id) ?? Array.Empty<CourseFinalSubmission>()
                    : Array.Empty<CourseFinalSubmission>();
                var allPassed = modules.Count > 0 && PulseModuleReader.CountPassed(modules, moduleProgress) == modules.Count;
                var finalStatus = PulseRules.FinalStatusOf(enrollment, courseSubmissions, allPassed, now);
                var slot = approved ? PulseSlotStatus.Completed
                    : finalStatus == PulseFinalStatus.Pending ? PulseSlotStatus.InReview
                    : finalStatus is PulseFinalStatus.Flagged or PulseFinalStatus.DeadlineMissed ? PulseSlotStatus.NeedsSupport
                    : enrollment != null && block is PulseBlockReason.NotAssessed or PulseBlockReason.PriorLevelRequired && course.Tier > 1 ? PulseSlotStatus.SeatHeld
                    : enrollment != null ? PulseSlotStatus.InProgress
                    : !assessed ? PulseSlotStatus.AfterBaseline
                    : course.Tier == 1 ? PulseSlotStatus.FreeToStart
                    : prereqApproved ? PulseSlotStatus.SeatNeeded
                    : PulseSlotStatus.AfterPriorLevel;
                return new PulseCourseState
                {
                    Course = course,
                    Domain = domain,
                    InPath = inPath,
                    Access = access,
                    Enrollment = enrollment,
                    Approved = approved,
                    PrereqApproved = prereqApproved,
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
            Assessed = assessed,
            AssessedAt = assessed ? baselines.Max(b => b.AssessedAt) : null,
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

    /// <summary>18 khóa chuẩn: một khóa cho mỗi (lĩnh vực, cấp) trong số khóa PUBLISHED của tổ chức.</summary>
    public async Task<List<PulseCourseRef>> LoadCatalogAsync(Guid organizationId)
    {
        var rows = await (
                from course in _context.Courses.AsNoTracking()
                join teaching in _context.CourseCompetencies.AsNoTracking() on course.Id equals teaching.CourseId
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                where course.OrganizationId == organizationId && course.Status == Statuses.Course.Published
                select new
                {
                    course.Id,
                    course.Code,
                    course.Title,
                    course.Description,
                    course.Purpose,
                    course.EstimatedDurationMinutes,
                    course.VersionNo,
                    competency.CategoryId,
                    teaching.TargetLevel,
                })
            .ToListAsync();

        var perCourse = rows
            .GroupBy(r => r.Id)
            .Select(g =>
            {
                var first = g.First();
                var category = g.GroupBy(r => r.CategoryId).OrderByDescending(c => c.Count()).ThenBy(c => c.Key).First().Key;
                return new PulseCourseRef
                {
                    CourseId = first.Id,
                    Code = first.Code,
                    Title = first.Title,
                    Description = first.Description,
                    Purpose = first.Purpose,
                    EstimatedMinutes = first.EstimatedDurationMinutes,
                    VersionNo = first.VersionNo,
                    CategoryId = category,
                    Tier = Math.Clamp((int)g.Max(r => r.TargetLevel), 1, PulseRules.MaxLevel),
                };
            })
            .ToList();

        return perCourse
            .GroupBy(c => c.Code, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderByDescending(c => c.VersionNo).First())
            .GroupBy(c => (c.CategoryId, c.Tier))
            .Select(g => g.OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).First())
            .ToList();
    }

    /// <summary>Mục tiêu theo lĩnh vực của vị trí: mức yêu cầu lớn nhất trong lĩnh vực (bộ yêu cầu ACTIVE).</summary>
    public async Task<Dictionary<Guid, int>> LoadTargetsAsync(Guid? jobPositionId)
    {
        if (!jobPositionId.HasValue)
        {
            return new Dictionary<Guid, int>();
        }

        var rows = await (
                from set in _context.PositionRequirementSets.AsNoTracking()
                join item in _context.PositionRequirementItems.AsNoTracking() on set.Id equals item.RequirementSetId
                join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                where set.JobPositionId == jobPositionId.Value && set.Status == Statuses.PositionRequirementSet.Active
                select new { competency.CategoryId, item.RequiredLevel })
            .ToListAsync();

        return rows
            .GroupBy(r => r.CategoryId)
            .ToDictionary(g => g.Key, g => Math.Clamp(g.Max(r => r.RequiredLevel), 0, PulseRules.MaxLevel));
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
}
