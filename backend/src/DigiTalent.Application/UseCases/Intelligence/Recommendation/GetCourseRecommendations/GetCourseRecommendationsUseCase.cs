using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.Recommendation;

/// <summary>
/// Gợi ý khóa học từ snapshot skill gap mới nhất (spec §5) — tính trực tiếp, không lưu.
/// Khóa ứng viên: PUBLISHED, version mới nhất theo code, dạy năng lực đang thiếu; loại khóa đã COMPLETED.
/// Danh sách rỗng luôn kèm Reason để FE hiển thị đúng thông điệp.
/// </summary>
public class GetCourseRecommendationsUseCase : IUseCase<GetCourseRecommendationsUseCaseInput, GetCourseRecommendationsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly RecommendationWeightsProvider _weightsProvider;

    public GetCourseRecommendationsUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        RecommendationWeightsProvider weightsProvider)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _weightsProvider = weightsProvider;
    }

    public async Task<GetCourseRecommendationsUseCaseOutput> ExecuteAsync(GetCourseRecommendationsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var weights = await _weightsProvider.GetAsync(organizationId);
        var output = new GetCourseRecommendationsUseCaseOutput { ScoringConfigVersion = weights.Version };

        var employeeId = input.EmployeeId ?? _currentUser.EmployeeId;
        if (employeeId == null)
        {
            return WithReason(output, RecommendationEmptyReasons.NoEmployeeProfile);
        }

        var employee = await _employeeScope.GetVisibleEmployeeAsync(employeeId.Value);
        output.EmployeeId = employee.Id;

        var run = await LoadLatestRunWithGapsAsync(employee.Id);
        if (run == null)
        {
            return WithReason(output, RecommendationEmptyReasons.NoSkillGapRun);
        }

        output.SkillGapRunId = run.Id;
        output.GeneratedAt = run.GeneratedAt;

        var gaps = run.Gaps;
        if (gaps.Count == 0)
        {
            return WithReason(output, RecommendationEmptyReasons.NoGap);
        }

        var candidates = await LoadCandidateCoursesAsync(organizationId, employee.Id, gaps.Select(g => g.CompetencyId).ToList());
        var ranked = CourseRecommender.Rank(gaps, candidates, weights, input.Limit);
        if (ranked.Count == 0)
        {
            return WithReason(output, RecommendationEmptyReasons.NoMatchingCourse);
        }

        output.Items = ranked.Select(ToDto).ToList();
        return output;
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
    private async Task<List<CandidateCourse>> LoadCandidateCoursesAsync(Guid organizationId, Guid employeeId, List<Guid> gapCompetencyIds)
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
                    g.Select(r => r.Teaching).ToList());
            })
            .ToList();
    }

    private static GetCourseRecommendationsUseCaseOutput WithReason(GetCourseRecommendationsUseCaseOutput output, string reason)
    {
        output.Reason = reason;
        return output;
    }

    private static CourseRecommendationDto ToDto(RankedCourse ranked) => new()
    {
        CourseId = ranked.Course.CourseId,
        CourseCode = ranked.Course.Code,
        Title = ranked.Course.Title,
        EstimatedDurationMinutes = ranked.Course.EstimatedDurationMinutes,
        EntryLevel = ranked.Course.EntryLevel,
        EnrollmentStatus = ranked.Course.EnrollmentStatus,
        Score = ranked.Score,
        Breakdown = new RecommendationBreakdownDto
        {
            GapPriorityCoverage = ranked.Breakdown.GapPriorityCoverage,
            MandatoryCoverage = ranked.Breakdown.MandatoryCoverage,
            EntryLevelFit = ranked.Breakdown.EntryLevelFit,
        },
        Reasons = ranked.Reasons.Select(r => new RecommendationReasonDto
        {
            CompetencyId = r.CompetencyId,
            CompetencyName = r.CompetencyName,
            CurrentLevel = r.CurrentLevel,
            RequiredLevel = r.RequiredLevel,
            CourseTargetLevel = r.CourseTargetLevel,
            CoverageType = r.CoverageType,
            ClosesSteps = r.ClosesSteps,
            Mandatory = r.Mandatory,
            Severity = r.Severity,
        }).ToList(),
        Explanation = ranked.Explanation,
        Warnings = ranked.Warnings.ToList(),
    };
}
