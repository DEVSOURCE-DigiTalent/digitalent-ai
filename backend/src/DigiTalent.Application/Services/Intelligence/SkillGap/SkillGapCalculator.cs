using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.Services.Intelligence.SkillGap;

/// <summary>
/// Skill Gap Engine (NF-01) — hàm thuần, không đụng database, giải thích được.
/// Công thức: docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md §4.
///   gap      = max(0, required − (confirmed ?? 0))
///   priority = gap × weight_percent × (mandatory ? k : 1)
///   severity = NULL (đạt) | HIGH (gap ≥ 2 hoặc bắt buộc) | MEDIUM (weight ≥ ngưỡng) | LOW
/// </summary>
public static class SkillGapCalculator
{
    /// <summary>Đổi công thức → tăng version để snapshot cũ vẫn giải thích được (BR-08).</summary>
    public const string CalculationVersion = "SG-1.0";

    private const decimal NonMandatoryMultiplier = 1.00m;
    private const int HighGapSteps = 2;

    public static SkillGapResult Calculate(
        IReadOnlyList<SkillGapRequirementLine> requirements,
        IReadOnlyDictionary<Guid, short> confirmedLevels,
        SkillGapSettings settings)
    {
        var items = requirements
            .Select(requirement => CalculateLine(requirement, confirmedLevels, settings))
            .ToList();

        return new SkillGapResult(items, Summarize(requirements, items));
    }

    private static SkillGapLineResult CalculateLine(
        SkillGapRequirementLine requirement,
        IReadOnlyDictionary<Guid, short> confirmedLevels,
        SkillGapSettings settings)
    {
        short? currentLevel = confirmedLevels.TryGetValue(requirement.CompetencyId, out var confirmed) ? confirmed : null;
        var gapSteps = (short)Math.Max(0, requirement.RequiredLevel - (currentLevel ?? 0));
        var multiplier = requirement.Mandatory ? settings.MandatoryMultiplier : NonMandatoryMultiplier;
        var priority = Round(gapSteps * requirement.WeightPercent * multiplier);

        return new SkillGapLineResult(
            requirement.CompetencyId,
            (short)requirement.RequiredLevel,
            currentLevel,
            gapSteps,
            requirement.WeightPercent,
            requirement.Mandatory,
            multiplier,
            priority,
            ClassifySeverity(gapSteps, requirement, settings));
    }

    private static string? ClassifySeverity(short gapSteps, SkillGapRequirementLine requirement, SkillGapSettings settings)
    {
        if (gapSteps == 0)
        {
            return null;
        }

        if (gapSteps >= HighGapSteps || requirement.Mandatory)
        {
            return Statuses.SkillGapSeverity.High;
        }

        return requirement.WeightPercent >= settings.MediumWeightThreshold
            ? Statuses.SkillGapSeverity.Medium
            : Statuses.SkillGapSeverity.Low;
    }

    private static SkillGapSummary Summarize(IReadOnlyList<SkillGapRequirementLine> requirements, IReadOnlyList<SkillGapLineResult> items)
    {
        var totalWeight = requirements.Sum(r => r.WeightPercent);
        var coveredWeight = items.Sum(i => i.WeightPercent * Math.Min(i.CurrentLevel ?? 0, i.RequiredLevel) / i.RequiredLevel);
        var coveragePercent = totalWeight == 0 ? 0m : Round(coveredWeight / totalWeight * 100m);

        return new SkillGapSummary(
            TotalRequired: items.Count,
            TotalMet: items.Count(i => i.GapSteps == 0),
            TotalGap: items.Count(i => i.GapSteps > 0),
            HighCount: items.Count(i => i.Severity == Statuses.SkillGapSeverity.High),
            MediumCount: items.Count(i => i.Severity == Statuses.SkillGapSeverity.Medium),
            LowCount: items.Count(i => i.Severity == Statuses.SkillGapSeverity.Low),
            CoveragePercent: coveragePercent);
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
