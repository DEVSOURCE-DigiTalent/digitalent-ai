using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// B7 (29/09/2026): chỉ gợi ý khóa người học đủ điều kiện vào — đã hoàn thành khóa tiên quyết, hoặc mức đã xác nhận
/// ở mọi năng lực của khóa ≥ mức khóa − 1 (khung chương trình A7: được bỏ qua khóa thấp nếu đã đạt).
/// </summary>
public class CourseEligibilityTests
{
    private static readonly Guid DataLiteracy = Guid.NewGuid();

    private static readonly RecommendationGap[] Gaps =
    {
        new(DataLiteracy, "Data literacy", 3, 1, true, 90m, Statuses.SkillGapSeverity.High),
    };

    private static CandidateCourse AdvancedCourse(CourseEligibility eligibility) =>
        new(Guid.NewGuid(), "A1-A", "Advanced", 2, 540, null, false,
            new[] { new CourseTeaching(DataLiteracy, 3, Statuses.CourseCoverageType.Primary, null) }, eligibility);

    [Fact]
    public void Rank_ExcludesCourseTwoLevelsAboveLearner_WhilePrerequisitesAreNotCompleted()
    {
        var notYet = AdvancedCourse(new CourseEligibility(PrerequisitesCompleted: false, MinConfirmedLevel: 1, CourseLevel: 3));

        CourseRecommender.Rank(Gaps, new[] { notYet }, RecommendationWeights.Default, limit: 10).Should().BeEmpty();
    }

    [Fact]
    public void Rank_IncludesCourse_OncePrerequisitesAreCompleted()
    {
        var unlocked = AdvancedCourse(new CourseEligibility(PrerequisitesCompleted: true, MinConfirmedLevel: 1, CourseLevel: 3));

        CourseRecommender.Rank(Gaps, new[] { unlocked }, RecommendationWeights.Default, limit: 10).Should().ContainSingle();
    }

    [Fact]
    public void Rank_LetsLearnerSkipLowerCourse_WhenConfirmedLevelIsOneBelowCourse()
    {
        var skipLower = AdvancedCourse(new CourseEligibility(PrerequisitesCompleted: false, MinConfirmedLevel: 2, CourseLevel: 3));
        var gap = new[] { Gaps[0] with { CurrentLevel = 2, PriorityScore = 45m } };

        CourseRecommender.Rank(gap, new[] { skipLower }, RecommendationWeights.Default, limit: 10).Should().ContainSingle();
    }

    [Fact]
    public void Rank_AccountantAllBasic_RecommendsNextIntermediateCourses()
    {
        var accountant = Tt02Catalog.Positions.Single(p => p.Code == "ACCOUNTANT");
        var competencyIds = Tt02Catalog.CompetencyCodes.ToDictionary(code => code, _ => Guid.NewGuid());
        var requirements = Tt02Catalog.RequirementsFor(accountant)
            .Select(r => new SkillGapRequirementLine(competencyIds[r.SourceCode], r.RequiredLevel, r.WeightPercent, r.Mandatory))
            .ToList();
        var skillGap = SkillGapCalculator.Calculate(requirements, competencyIds.Values.ToDictionary(id => id, _ => (short)1), SkillGapSettings.Default);
        var gaps = skillGap.Items
            .Where(i => i.GapSteps > 0)
            .Select(i => new RecommendationGap(i.CompetencyId, i.CompetencyId.ToString(), i.RequiredLevel, i.CurrentLevel, i.Mandatory, i.PriorityScore, i.Severity))
            .ToList();

        var courses = Tt02Catalog.Domains
            .SelectMany(domain => Enumerable.Range(1, 3).Select(level => new CandidateCourse(
                Guid.NewGuid(),
                domain.CourseCode(level),
                domain.CourseTitles[level - 1],
                (short)Math.Max(1, level - 1),
                domain.CourseMinutes(level),
                null,
                false,
                domain.Competencies.Select(c => new CourseTeaching(competencyIds[c.SourceCode], (short)level, Statuses.CourseCoverageType.Primary, null)).ToList(),
                new CourseEligibility(PrerequisitesCompleted: level == 1, MinConfirmedLevel: 1, CourseLevel: (short)level))))
            .ToList();

        var ranked = CourseRecommender.Rank(gaps, courses, RecommendationWeights.Default, limit: 10);

        // Số tính tay: spec Sprint 3 §5.3.1 (ma trận theo từng năng lực). Khóa -A chỉ mở sau khi xong khóa -I tương ứng.
        // A5-I và A3-I hòa điểm và thời lượng → xếp theo tên khóa.
        ranked.Select(r => r.Course.Code).Should().Equal("A1-I", "A4-I", "A2-I", "M6-I", "A5-I", "A3-I");
        ranked.Select(r => r.Score).Should().Equal(32.00m, 28.51m, 23.62m, 16.99m, 15.25m, 15.25m);
        ranked[0].Breakdown.Should().Be(new RecommendationBreakdown(GapPriorityCoverage: 14.00m, MandatoryCoverage: 8m, EntryLevelFit: 10m));
    }
}
