using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.Services.Intelligence.Recommendation;

/// <summary>
/// Xếp hạng khóa học theo mức lấp khoảng trống năng lực — hàm thuần, giải thích được.
/// Công thức: docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md §5.2 và §5.6.
///   score = W_gap × GAP_PRIORITY_COVERAGE + W_mand × MANDATORY_COVERAGE + W_entry × ENTRY_LEVEL_FIT   (0–100)
/// </summary>
public static class CourseRecommender
{
    private const decimal PrimaryCoverageFactor = 1.0m;
    private const decimal SecondaryCoverageFactor = 0.6m;
    private const decimal SupportingCoverageFactor = 0.3m;

    public static IReadOnlyList<RankedCourse> Rank(
        IReadOnlyList<RecommendationGap> gaps,
        IReadOnlyList<CandidateCourse> courses,
        RecommendationWeights weights,
        int limit)
    {
        var openGaps = gaps
            .Where(g => (g.CurrentLevel ?? 0) < g.RequiredLevel)
            .ToDictionary(g => g.CompetencyId);
        if (openGaps.Count == 0)
        {
            return Array.Empty<RankedCourse>();
        }

        var totalPriority = openGaps.Values.Sum(g => g.PriorityScore);
        var mandatoryGapCount = openGaps.Values.Count(g => g.Mandatory);

        return courses
            .Where(c => !c.IsCompleted)
            .Select(c => Score(c, openGaps, totalPriority, mandatoryGapCount, weights))
            .Where(r => r != null && r.Score > 0)
            .Select(r => r!)
            .OrderByDescending(r => r.Score)
            .ThenBy(r => r.Course.EstimatedDurationMinutes ?? int.MaxValue)
            .ThenBy(r => r.Course.Title, StringComparer.OrdinalIgnoreCase)
            .Take(limit)
            .ToList();
    }

    private static RankedCourse? Score(
        CandidateCourse course,
        IReadOnlyDictionary<Guid, RecommendationGap> openGaps,
        decimal totalPriority,
        int mandatoryGapCount,
        RecommendationWeights weights)
    {
        // Chỉ tính năng lực đang thiếu mà khóa học nâng được ít nhất 1 bậc
        var covered = course.Teaches
            .Where(t => openGaps.TryGetValue(t.CompetencyId, out var gap) && t.TargetLevel > Current(gap))
            .Select(t => (Teaching: t, Gap: openGaps[t.CompetencyId]))
            .OrderByDescending(x => x.Gap.PriorityScore)
            .ThenBy(x => x.Gap.CompetencyName, StringComparer.OrdinalIgnoreCase)
            .ToList();
        if (covered.Count == 0)
        {
            return null;
        }

        var gapCoverage = totalPriority == 0
            ? 0m
            : covered.Sum(x => x.Gap.PriorityScore * CloseFraction(x.Teaching, x.Gap) * CoverageFactor(x.Teaching)) / totalPriority;
        var mandatoryCoverage = mandatoryGapCount == 0
            ? 0m
            : (decimal)covered.Count(x => x.Gap.Mandatory) / mandatoryGapCount;
        var entryLevelFit = IsEntryLevelMet(course, covered) ? 1m : 0m;

        var gapPoints = weights.GapPriorityCoverage * gapCoverage;
        var mandatoryPoints = weights.MandatoryCoverage * mandatoryCoverage;
        var entryPoints = weights.EntryLevelFit * entryLevelFit;

        var reasons = covered.Select(x => ToReason(x.Teaching, x.Gap)).ToList();
        var warnings = entryLevelFit == 0m
            ? new[] { RecommendationWarnings.EntryLevelNotMet }
            : Array.Empty<string>();

        return new RankedCourse(
            course,
            Round(gapPoints + mandatoryPoints + entryPoints),
            new RecommendationBreakdown(Round(gapPoints), Round(mandatoryPoints), Round(entryPoints)),
            reasons,
            string.Join(" ", reasons.Select(Explain)),
            warnings);
    }

    /// <summary>Tỉ lệ khoảng trống mà khóa học lấp: (min(target, required) − current) / (required − current).</summary>
    private static decimal CloseFraction(CourseTeaching teaching, RecommendationGap gap)
    {
        var current = Current(gap);
        return (decimal)(Math.Min(teaching.TargetLevel, gap.RequiredLevel) - current) / (gap.RequiredLevel - current);
    }

    /// <summary>coverage_weight (0–100) nếu có, ngược lại theo coverage_type.</summary>
    private static decimal CoverageFactor(CourseTeaching teaching)
    {
        if (teaching.CoverageWeight.HasValue)
        {
            return teaching.CoverageWeight.Value / 100m;
        }

        return teaching.CoverageType switch
        {
            Statuses.CourseCoverageType.Primary => PrimaryCoverageFactor,
            Statuses.CourseCoverageType.Secondary => SecondaryCoverageFactor,
            _ => SupportingCoverageFactor,
        };
    }

    /// <summary>
    /// Đủ trình độ đầu vào khi entry_level NULL hoặc current nhỏ nhất ≥ entry_level − 1
    /// (xét năng lực PRIMARY mà khóa lấp; không có PRIMARY thì xét mọi năng lực lấp được).
    /// </summary>
    private static bool IsEntryLevelMet(CandidateCourse course, IReadOnlyList<(CourseTeaching Teaching, RecommendationGap Gap)> covered)
    {
        if (!course.EntryLevel.HasValue)
        {
            return true;
        }

        var primary = covered.Where(x => x.Teaching.CoverageType == Statuses.CourseCoverageType.Primary).ToList();
        var basis = primary.Count > 0 ? primary : covered;
        return basis.Min(x => Current(x.Gap)) >= course.EntryLevel.Value - 1;
    }

    private static RecommendationReason ToReason(CourseTeaching teaching, RecommendationGap gap) => new(
        gap.CompetencyId,
        gap.CompetencyName,
        gap.CurrentLevel,
        gap.RequiredLevel,
        teaching.TargetLevel,
        teaching.CoverageType,
        (short)(Math.Min(teaching.TargetLevel, gap.RequiredLevel) - Current(gap)),
        gap.Mandatory,
        gap.Severity);

    private static string Explain(RecommendationReason reason)
    {
        var mandatory = reason.Mandatory ? ", mandatory" : string.Empty;
        return $"Raises {reason.CompetencyName} from {CompetencyLevelLabels.For(reason.CurrentLevel)} "
               + $"to {CompetencyLevelLabels.For(reason.CourseTargetLevel)} "
               + $"(required: {CompetencyLevelLabels.For(reason.RequiredLevel)}{mandatory}).";
    }

    private static int Current(RecommendationGap gap) => gap.CurrentLevel ?? 0;

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
