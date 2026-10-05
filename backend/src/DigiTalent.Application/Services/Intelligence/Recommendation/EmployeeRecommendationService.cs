using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Services.Intelligence.Recommendation;

/// <summary>
/// Gợi ý khóa học cho 1 nhân viên từ snapshot skill gap mới nhất (spec §5): nạp dữ liệu rồi xếp hạng bằng CourseRecommender.
/// Dùng chung cho màn hình gợi ý và chỉ số "gợi ý chờ duyệt" của dashboard. Không kiểm tra phạm vi —
/// người gọi phải lọc nhân viên qua EmployeeScope trước.
/// </summary>
public class EmployeeRecommendationService
{
    private readonly IApplicationDbContext _context;

    public EmployeeRecommendationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeRecommendationResult> RecommendAsync(Guid organizationId, Guid employeeId, RecommendationWeights weights, int limit)
    {
        var run = await LoadLatestRunWithGapsAsync(employeeId);
        if (run == null)
        {
            return EmployeeRecommendationResult.Empty(RecommendationEmptyReasons.NoSkillGapRun);
        }

        if (run.Gaps.Count == 0)
        {
            return EmployeeRecommendationResult.Empty(RecommendationEmptyReasons.NoGap, run.Id, run.GeneratedAt);
        }

        var candidates = await LoadCandidateCoursesAsync(organizationId, employeeId, run.Id, run.Gaps.Select(g => g.CompetencyId).ToList());
        var ranked = CourseRecommender.Rank(run.Gaps, candidates, weights, limit);
        return ranked.Count == 0
            ? EmployeeRecommendationResult.Empty(RecommendationEmptyReasons.NoMatchingCourse, run.Id, run.GeneratedAt)
            : new EmployeeRecommendationResult(run.Id, run.GeneratedAt, null, ranked);
    }

    /// <summary>Snapshot mới nhất (tie-break theo Id) kèm các năng lực còn thiếu — 1 truy vấn.</summary>
    private async Task<LatestRun?> LoadLatestRunWithGapsAsync(Guid employeeId)
    {
        var run = await _context.SkillGapRuns
            .AsNoTracking()
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.GeneratedAt)
            .ThenByDescending(r => r.Id)
            .Select(r => new
            {
                r.Id,
                r.GeneratedAt,
                Gaps = (
                    from item in _context.SkillGapItems
                    join competency in _context.Competencies on item.CompetencyId equals competency.Id
                    where item.SkillGapRunId == r.Id && item.GapSteps > 0
                    select new
                    {
                        item.CompetencyId,
                        competency.Name,
                        item.RequiredLevel,
                        item.CurrentLevel,
                        item.Mandatory,
                        item.PriorityScore,
                        item.Severity,
                    }).ToList(),
            })
            .FirstOrDefaultAsync();

        return run == null
            ? null
            : new LatestRun(
                run.Id,
                run.GeneratedAt,
                run.Gaps
                    .Select(g => new RecommendationGap(g.CompetencyId, g.Name, g.RequiredLevel, g.CurrentLevel, g.Mandatory, g.PriorityScore, g.Severity))
                    .ToList());
    }

    private sealed record LatestRun(Guid Id, DateTimeOffset GeneratedAt, List<RecommendationGap> Gaps);

    /// <summary>
    /// Khóa PUBLISHED dạy ít nhất 1 năng lực đang thiếu, và là version PUBLISHED mới nhất của code đó
    /// trong toàn tổ chức (spec §5.6 R1) — kèm trạng thái enrollment của nhân viên (R2).
    /// </summary>
    private async Task<List<CandidateCourse>> LoadCandidateCoursesAsync(
        Guid organizationId, Guid employeeId, Guid skillGapRunId, List<Guid> gapCompetencyIds)
    {
        var courses = _context.Courses.AsNoTracking();
        var rows = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join course in courses on teaching.CourseId equals course.Id
                where course.OrganizationId == organizationId
                      && course.Status == Statuses.Course.Published
                      && gapCompetencyIds.Contains(teaching.CompetencyId)
                      && !courses.Any(newer => newer.OrganizationId == course.OrganizationId
                                               && newer.Code == course.Code
                                               && newer.Status == Statuses.Course.Published
                                               && newer.VersionNo > course.VersionNo)
                select new
                {
                    course.Id,
                    course.Code,
                    course.Title,
                    course.EntryLevel,
                    course.EstimatedDurationMinutes,
                    Teaching = new CourseTeaching(teaching.CompetencyId, teaching.TargetLevel, teaching.CoverageType, teaching.CoverageWeight),
                })
            .ToListAsync();
        if (rows.Count == 0)
        {
            return new List<CandidateCourse>();
        }

        var courseIds = rows.Select(r => r.Id).Distinct().ToList();
        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId && courseIds.Contains(e.CourseId))
            .Select(e => new { e.CourseId, e.Status })
            .ToListAsync();
        var completedCourseIds = enrollments
            .Where(e => e.Status == Statuses.Enrollment.Completed)
            .Select(e => e.CourseId)
            .ToHashSet();
        var openStatuses = enrollments
            .Where(e => e.Status != Statuses.Enrollment.Completed && e.Status != Statuses.Enrollment.Cancelled)
            .GroupBy(e => e.CourseId)
            .ToDictionary(g => g.Key, g => g.First().Status);
        var eligibility = await LoadEligibilityAsync(employeeId, skillGapRunId, courseIds);

        return rows
            .GroupBy(r => r.Id)
            .Select(g =>
            {
                var course = g.First();
                return new CandidateCourse(
                    course.Id,
                    course.Code,
                    course.Title,
                    course.EntryLevel,
                    course.EstimatedDurationMinutes,
                    openStatuses.GetValueOrDefault(course.Id),
                    completedCourseIds.Contains(course.Id),
                    g.Select(r => r.Teaching).ToList(),
                    eligibility[course.Id]);
            })
            .ToList();
    }

    /// <summary>
    /// Điều kiện vào khóa (B7): tiên quyết đã COMPLETED (so theo mã khóa để chấp nhận mọi version),
    /// và mức đã xác nhận thấp nhất trên các năng lực của khóa mà VỊ TRÍ CÓ YÊU CẦU — kể cả năng lực đã đạt,
    /// nhưng bỏ qua năng lực vị trí không yêu cầu (D-B7: vị trí không cần mọi năng lực của miền).
    /// </summary>
    private async Task<Dictionary<Guid, CourseEligibility>> LoadEligibilityAsync(Guid employeeId, Guid skillGapRunId, List<Guid> courseIds)
    {
        var requiredCompetencyIds = _context.SkillGapItems
            .Where(i => i.SkillGapRunId == skillGapRunId)
            .Select(i => i.CompetencyId);
        var teachings = await _context.CourseCompetencies
            .AsNoTracking()
            .Where(t => courseIds.Contains(t.CourseId) && requiredCompetencyIds.Contains(t.CompetencyId))
            .Select(t => new { t.CourseId, t.CompetencyId, t.TargetLevel })
            .ToListAsync();
        var prerequisiteCodes = await (
                from prerequisite in _context.CoursePrerequisites.AsNoTracking()
                join course in _context.Courses on prerequisite.PrerequisiteCourseId equals course.Id
                where courseIds.Contains(prerequisite.CourseId)
                select new { prerequisite.CourseId, course.Code })
            .ToListAsync();
        var completedCodes = (await (
                from enrollment in _context.Enrollments.AsNoTracking()
                join course in _context.Courses on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employeeId && enrollment.Status == Statuses.Enrollment.Completed
                select course.Code)
            .ToListAsync()).ToHashSet();
        var competencyIds = teachings.Select(t => t.CompetencyId).Distinct().ToList();
        var confirmed = await _context.EmployeeCompetencyProfiles
            .AsNoTracking()
            .Where(p => p.EmployeeId == employeeId && competencyIds.Contains(p.CompetencyId))
            .ToDictionaryAsync(p => p.CompetencyId, p => p.ConfirmedLevel);

        return courseIds.ToDictionary(courseId => courseId, courseId =>
        {
            var courseTeachings = teachings.Where(t => t.CourseId == courseId).ToList();
            var prerequisitesDone = prerequisiteCodes.Where(p => p.CourseId == courseId).All(p => completedCodes.Contains(p.Code));
            var minConfirmed = courseTeachings.Min(t => confirmed.GetValueOrDefault(t.CompetencyId));
            return new CourseEligibility(prerequisitesDone, minConfirmed, courseTeachings.Max(t => t.TargetLevel));
        });
    }
}

/// <summary>Kết quả gợi ý cho 1 nhân viên; danh sách rỗng luôn kèm EmptyReason (RecommendationEmptyReasons).</summary>
public sealed record EmployeeRecommendationResult(
    Guid? SkillGapRunId,
    DateTimeOffset? GeneratedAt,
    string? EmptyReason,
    IReadOnlyList<RankedCourse> Items)
{
    public static EmployeeRecommendationResult Empty(string reason, Guid? runId = null, DateTimeOffset? generatedAt = null) =>
        new(runId, generatedAt, reason, Array.Empty<RankedCourse>());
}
