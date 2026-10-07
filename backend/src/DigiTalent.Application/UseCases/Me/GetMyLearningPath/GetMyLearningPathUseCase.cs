using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-05 — Lộ trình học tập: khóa đã được giao / tự ghi danh + khóa gợi ý (CourseRecommender, theo skill gap tính trực tiếp),
/// sắp theo trạng thái rồi đảm bảo khóa tiên quyết đứng trước. Mỗi bước có lý do và năng lực mục tiêu.
/// </summary>
public class GetMyLearningPathUseCase : IUseCase<GetMyLearningPathUseCaseInput, GetMyLearningPathUseCaseOutput>
{
    private const int MaxRecommendations = 5;

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyCompetencySnapshotBuilder _snapshotBuilder;
    private readonly MyCourseReader _courseReader;
    private readonly RecommendationWeightsProvider _weightsProvider;

    public GetMyLearningPathUseCase(
        IApplicationDbContext context,
        MyEmployeeContext me,
        MyCompetencySnapshotBuilder snapshotBuilder,
        MyCourseReader courseReader,
        RecommendationWeightsProvider weightsProvider)
    {
        _context = context;
        _me = me;
        _snapshotBuilder = snapshotBuilder;
        _courseReader = courseReader;
        _weightsProvider = weightsProvider;
    }

    public async Task<GetMyLearningPathUseCaseOutput> ExecuteAsync(GetMyLearningPathUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var snapshot = await _snapshotBuilder.BuildAsync(employee);
        var rows = await _courseReader.LoadAsync(employee.Id);

        var linesByCompetency = snapshot.Lines.ToDictionary(l => l.CompetencyId);
        var confirmedLevels = snapshot.Confirmed.ToDictionary(c => c.CompetencyId, c => c.Level);
        var takenCodes = rows.Select(r => r.Course.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var completedCodes = rows.Where(r => r.Enrollment.Status == Statuses.Enrollment.Completed)
            .Select(r => r.Course.Code)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var recommendations = await RecommendAsync(employee.OrganizationId, snapshot, takenCodes, completedCodes, confirmedLevels);

        var stepCourseIds = rows.Select(r => r.Course.Id).Concat(recommendations.Select(r => r.Course.CourseId)).Distinct().ToList();
        var teachings = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                where stepCourseIds.Contains(teaching.CourseId)
                orderby competency.Code
                select new { teaching.CourseId, teaching.CompetencyId, teaching.TargetLevel, competency.Code, competency.Name })
            .ToListAsync();
        var prerequisites = await (
                from prerequisite in _context.CoursePrerequisites.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on prerequisite.PrerequisiteCourseId equals course.Id
                where stepCourseIds.Contains(prerequisite.CourseId)
                orderby course.Code
                select new { prerequisite.CourseId, PrerequisiteId = course.Id, course.Code, course.Title })
            .ToListAsync();

        List<MyPathCompetencyDto> TargetsOf(Guid courseId) => teachings
            .Where(t => t.CourseId == courseId)
            .Select(t =>
            {
                var line = linesByCompetency.GetValueOrDefault(t.CompetencyId);
                short? current = confirmedLevels.TryGetValue(t.CompetencyId, out var level) ? level : null;
                return new MyPathCompetencyDto
                {
                    Code = t.Code,
                    Name = t.Name,
                    TargetLevel = t.TargetLevel,
                    CurrentLevel = current,
                    ClosesGap = line != null && line.GapSteps > 0 && t.TargetLevel > (current ?? 0),
                };
            })
            .ToList();

        List<MyPrerequisiteDto> PrerequisitesOf(Guid courseId) => prerequisites
            .Where(p => p.CourseId == courseId)
            .Select(p => new MyPrerequisiteDto { CourseId = p.PrerequisiteId, Code = p.Code, Title = p.Title, Completed = completedCodes.Contains(p.Code) })
            .ToList();

        var enrolledSteps = rows.Select(row => new MyLearningPathStepDto
        {
            CourseId = row.Course.Id,
            CourseCode = row.Course.Code,
            CourseTitle = row.Course.Title,
            Level = row.Level,
            EstimatedDurationMinutes = row.Course.EstimatedDurationMinutes,
            Source = row.Source,
            Status = row.Enrollment.Status,
            ProgressPercent = row.Enrollment.ProgressPercent,
            DueDate = row.Enrollment.DueDate?.ToString("yyyy-MM-dd"),
            IsOverdue = row.IsOverdue(today),
            AssignedByName = row.AssignedByName,
            Rationale = EnrolledRationale(row),
            TargetCompetencies = TargetsOf(row.Course.Id),
            Prerequisites = PrerequisitesOf(row.Course.Id),
        });

        var recommendedSteps = recommendations.Select(r => new MyLearningPathStepDto
        {
            CourseId = r.Course.CourseId,
            CourseCode = r.Course.Code,
            CourseTitle = r.Course.Title,
            Level = r.Course.Teaches.Count == 0 ? (short)1 : r.Course.Teaches.Max(t => t.TargetLevel),
            EstimatedDurationMinutes = r.Course.EstimatedDurationMinutes,
            Source = "RECOMMENDED",
            Status = "RECOMMENDED",
            Rationale = RecommendedRationale(r, linesByCompetency),
            RecommendationScore = r.Score,
            TargetCompetencies = TargetsOf(r.Course.CourseId),
            Prerequisites = PrerequisitesOf(r.Course.CourseId),
            CanEnroll = true,
            Warnings = r.Warnings.ToList(),
        });

        var steps = OrderByPrerequisites(
            enrolledSteps
                .OrderBy(s => StatusRank(s.Status))
                .ThenBy(s => s.DueDate ?? "9999-12-31", StringComparer.Ordinal)
                .ThenBy(s => s.CourseCode, StringComparer.OrdinalIgnoreCase)
                .Concat(recommendedSteps)
                .ToList());
        for (var i = 0; i < steps.Count; i++)
        {
            steps[i].Order = i + 1;
        }

        var totalMinutes = steps.Sum(s => s.EstimatedDurationMinutes ?? 0);
        var remainingMinutes = steps
            .Where(s => s.Status != Statuses.Enrollment.Completed)
            .Sum(s => (int)Math.Round((s.EstimatedDurationMinutes ?? 0) * (100m - s.ProgressPercent) / 100m));

        return new GetMyLearningPathUseCaseOutput
        {
            JobPositionName = snapshot.Position?.Name,
            SkipReason = snapshot.SkipReason,
            OpenGapCount = snapshot.Lines.Count(l => l.GapSteps > 0),
            CoveragePercent = snapshot.Summary?.CoveragePercent,
            Summary = new MyLearningPathSummaryDto
            {
                TotalSteps = steps.Count,
                CompletedSteps = steps.Count(s => s.Status == Statuses.Enrollment.Completed),
                InProgressSteps = steps.Count(s => s.Status is Statuses.Enrollment.InProgress or Statuses.Enrollment.ReadyForAssessment),
                RecommendedSteps = steps.Count(s => s.Source == "RECOMMENDED"),
                TotalMinutes = totalMinutes,
                RemainingMinutes = remainingMinutes,
            },
            Steps = steps,
        };
    }

    private async Task<IReadOnlyList<RankedCourse>> RecommendAsync(
        Guid organizationId,
        MyCompetencySnapshot snapshot,
        IReadOnlySet<string> takenCodes,
        IReadOnlySet<string> completedCodes,
        IReadOnlyDictionary<Guid, short> confirmedLevels)
    {
        var gaps = snapshot.Lines
            .Where(l => l.GapSteps > 0)
            .Select(l => new RecommendationGap(l.CompetencyId, l.CompetencyName, l.RequiredLevel, l.CurrentLevel, l.Mandatory, l.PriorityScore, l.Severity))
            .ToList();
        if (gaps.Count == 0)
        {
            return Array.Empty<RankedCourse>();
        }

        var gapIds = gaps.Select(g => g.CompetencyId).ToList();
        var courses = _context.Courses.AsNoTracking();
        var rows = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join course in courses on teaching.CourseId equals course.Id
                where course.OrganizationId == organizationId
                      && course.Status == Statuses.Course.Published
                      && gapIds.Contains(teaching.CompetencyId)
                      && !courses.Any(newer => newer.OrganizationId == course.OrganizationId
                                               && newer.Code == course.Code
                                               && newer.Status == Statuses.Course.Published
                                               && newer.VersionNo > course.VersionNo)
                select new { course.Id, course.Code, course.Title, course.EntryLevel, course.EstimatedDurationMinutes })
            .Distinct()
            .ToListAsync();
        var candidates = rows.Where(r => !takenCodes.Contains(r.Code)).ToList();
        if (candidates.Count == 0)
        {
            return Array.Empty<RankedCourse>();
        }

        var candidateIds = candidates.Select(c => c.Id).ToList();
        var teachings = await _context.CourseCompetencies
            .AsNoTracking()
            .Where(t => candidateIds.Contains(t.CourseId))
            .Select(t => new { t.CourseId, Teaching = new CourseTeaching(t.CompetencyId, t.TargetLevel, t.CoverageType, t.CoverageWeight) })
            .ToListAsync();
        var prerequisiteCodes = await (
                from prerequisite in _context.CoursePrerequisites.AsNoTracking()
                join course in courses on prerequisite.PrerequisiteCourseId equals course.Id
                where candidateIds.Contains(prerequisite.CourseId)
                select new { prerequisite.CourseId, course.Code })
            .ToListAsync();
        var requiredIds = snapshot.Lines.Select(l => l.CompetencyId).ToHashSet();

        var candidateCourses = candidates.Select(c =>
        {
            var courseTeachings = teachings.Where(t => t.CourseId == c.Id).Select(t => t.Teaching).ToList();
            var relevant = courseTeachings.Where(t => requiredIds.Contains(t.CompetencyId)).ToList();
            if (relevant.Count == 0)
            {
                relevant = courseTeachings;
            }

            var eligibility = new CourseEligibility(
                prerequisiteCodes.Where(p => p.CourseId == c.Id).All(p => completedCodes.Contains(p.Code)),
                relevant.Count == 0 ? (short)0 : relevant.Min(t => confirmedLevels.GetValueOrDefault(t.CompetencyId)),
                relevant.Count == 0 ? (short)1 : relevant.Max(t => t.TargetLevel));

            return new CandidateCourse(c.Id, c.Code, c.Title, c.EntryLevel, c.EstimatedDurationMinutes, null, false, courseTeachings, eligibility);
        }).ToList();

        var weights = await _weightsProvider.GetAsync(organizationId);
        return CourseRecommender.Rank(gaps, candidateCourses, weights, MaxRecommendations);
    }

    private static int StatusRank(string status) => status switch
    {
        Statuses.Enrollment.Completed => 0,
        Statuses.Enrollment.ReadyForAssessment => 1,
        Statuses.Enrollment.InProgress => 2,
        _ => 3,
    };

    private static string EnrolledRationale(MyCourseRow row)
    {
        if (row.Assignment == null)
        {
            return "Bạn tự ghi danh khóa học này.";
        }

        var by = row.AssignedByName ?? "quản lý";
        return row.Assignment.AssignmentSource switch
        {
            Statuses.CourseAssignmentSource.SkillGap => $"Được {by} giao để bù khoảng trống năng lực theo vị trí việc làm.",
            Statuses.CourseAssignmentSource.Department => $"Khóa học bắt buộc của phòng ban (giao bởi {by}).",
            Statuses.CourseAssignmentSource.Position => $"Khóa học bắt buộc theo vị trí việc làm (giao bởi {by}).",
            _ => $"Được {by} giao trực tiếp.",
        };
    }

    private static string RecommendedRationale(RankedCourse ranked, IReadOnlyDictionary<Guid, MyCompetencyLine> lines)
    {
        var parts = ranked.Reasons.Select(reason =>
        {
            var code = lines.TryGetValue(reason.CompetencyId, out var line) ? line.CompetencyCode + " " : string.Empty;
            return $"{code}{reason.CompetencyName} ({MyLevelLabels.For(reason.CurrentLevel)} → {MyLevelLabels.For(reason.CourseTargetLevel)})";
        });
        return "Gợi ý để bù khoảng trống năng lực: " + string.Join("; ", parts) + ".";
    }

    /// <summary>Đưa khóa tiên quyết (cùng có trong lộ trình) lên trước khóa phụ thuộc, giữ nguyên thứ tự còn lại.</summary>
    public static List<MyLearningPathStepDto> OrderByPrerequisites(List<MyLearningPathStepDto> steps)
    {
        var result = new List<MyLearningPathStepDto>();
        var visiting = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var byCode = steps.GroupBy(s => s.CourseCode, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        void Visit(MyLearningPathStepDto step)
        {
            if (result.Contains(step) || !visiting.Add(step.CourseCode))
            {
                return; // đã thêm, hoặc vòng lặp tiên quyết (dữ liệu lỗi) → bỏ qua
            }

            foreach (var prerequisite in step.Prerequisites)
            {
                if (byCode.TryGetValue(prerequisite.Code, out var before))
                {
                    Visit(before);
                }
            }

            result.Add(step);
        }

        foreach (var step in steps)
        {
            Visit(step);
        }

        return result;
    }
}
