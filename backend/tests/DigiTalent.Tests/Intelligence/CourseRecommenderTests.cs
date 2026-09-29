using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Golden tests theo ví dụ §5.3 và các quy tắc §5.6 của docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md.
/// Gap đầu vào = snapshot §4.5: C1 (req 3, cur 1, bắt buộc, prio 90), C3 (req 2, chưa có, bắt buộc, prio 75), C4 (req 2, cur 1, prio 15).
/// </summary>
public class CourseRecommenderTests
{
    private static readonly Guid DataLiteracy = Guid.NewGuid();
    private static readonly Guid InformationSecurity = Guid.NewGuid();
    private static readonly Guid AiLiteracy = Guid.NewGuid();

    private static readonly RecommendationGap[] Gaps =
    {
        new(DataLiteracy, "Data literacy", 3, 1, true, 90m, Statuses.SkillGapSeverity.High),
        new(InformationSecurity, "Information security", 2, null, true, 75m, Statuses.SkillGapSeverity.High),
        new(AiLiteracy, "AI literacy", 2, 1, false, 15m, Statuses.SkillGapSeverity.Low),
    };

    private static CandidateCourse Course(
        string code,
        short? entryLevel,
        params CourseTeaching[] teaches) =>
        new(Guid.NewGuid(), code, code, entryLevel, EstimatedDurationMinutes: 60, EnrollmentStatus: null, IsCompleted: false, teaches);

    private static CourseTeaching Teaches(Guid competencyId, short target, string coverage = "PRIMARY", decimal? weight = null) =>
        new(competencyId, target, coverage, weight);

    private static readonly CandidateCourse K1 = Course("K1", 1, Teaches(DataLiteracy, 2), Teaches(AiLiteracy, 2, "SUPPORTING"));
    private static readonly CandidateCourse K2 = Course("K2", null, Teaches(InformationSecurity, 2));
    private static readonly CandidateCourse K3 = Course("K3", 2, Teaches(DataLiteracy, 3));

    [Fact]
    public void Rank_GoldenExample_OrdersAndScoresAsSpec()
    {
        var ranked = CourseRecommender.Rank(Gaps, new[] { K1, K2, K3 }, RecommendationWeights.Default, limit: 10);

        ranked.Select(r => r.Course.Code).Should().Equal("K3", "K2", "K1");
        ranked.Select(r => r.Score).Should().Equal(55.00m, 49.17m, 39.25m);
    }

    [Fact]
    public void Rank_GoldenExample_BreakdownIsInPoints()
    {
        var k1 = CourseRecommender.Rank(Gaps, new[] { K1 }, RecommendationWeights.Default, limit: 10).Single();

        k1.Breakdown.Should().Be(new RecommendationBreakdown(GapPriorityCoverage: 19.25m, MandatoryCoverage: 10m, EntryLevelFit: 10m));
    }

    [Fact]
    public void Rank_ExcludesCompletedCourses_KeepsOpenEnrollmentStatus()
    {
        var completed = K3 with { IsCompleted = true };
        var inProgress = K2 with { EnrollmentStatus = Statuses.Enrollment.InProgress };

        var ranked = CourseRecommender.Rank(Gaps, new[] { completed, inProgress }, RecommendationWeights.Default, limit: 10);

        ranked.Should().ContainSingle().Which.Course.EnrollmentStatus.Should().Be(Statuses.Enrollment.InProgress);
    }

    [Fact]
    public void Rank_IgnoresTeachingThatDoesNotRaiseCurrentLevel()
    {
        var teachesBasicDataOnly = Course("BASIC", null, Teaches(DataLiteracy, 1)); // current = 1 → không nâng được

        var ranked = CourseRecommender.Rank(Gaps, new[] { teachesBasicDataOnly }, RecommendationWeights.Default, limit: 10);

        ranked.Should().BeEmpty();
    }

    [Fact]
    public void Rank_IgnoresCompetenciesWithoutGap()
    {
        var met = new RecommendationGap(Guid.NewGuid(), "Met competency", 2, 2, true, 0m, null);
        var course = Course("MET", null, Teaches(met.CompetencyId, 3));

        var ranked = CourseRecommender.Rank(new[] { met }, new[] { course }, RecommendationWeights.Default, limit: 10);

        ranked.Should().BeEmpty();
    }

    [Theory]
    [InlineData((short)3, (short)1, 0)]    // entry 3, current 1 → chưa đủ đầu vào
    [InlineData((short)2, (short)1, 10)]   // entry 2, current 1 → đủ
    [InlineData((short)1, null, 10)]       // entry 1, chưa có cấp độ (0) → đủ
    public void Rank_EntryLevelFit(short entryLevel, short? current, int expectedPoints)
    {
        var gap = new RecommendationGap(DataLiteracy, "Data literacy", 3, current, false, 30m, Statuses.SkillGapSeverity.High);
        var course = Course("ENTRY", entryLevel, Teaches(DataLiteracy, 3));

        var ranked = CourseRecommender.Rank(new[] { gap }, new[] { course }, RecommendationWeights.Default, limit: 10).Single();

        ranked.Breakdown.EntryLevelFit.Should().Be(expectedPoints);
        ranked.Warnings.Should().HaveCount(expectedPoints == 0 ? 1 : 0);
        if (expectedPoints == 0)
        {
            ranked.Warnings.Should().Contain(RecommendationWarnings.EntryLevelNotMet);
        }
    }

    [Fact]
    public void Rank_EntryLevelFit_UsesPrimaryCompetenciesWhenPresent()
    {
        // PRIMARY = AI literacy (current 1), SUPPORTING = Information security (current 0); entry 2 → dựa vào PRIMARY → đủ
        var course = Course("MIX", 2, Teaches(AiLiteracy, 2), Teaches(InformationSecurity, 1, "SUPPORTING"));

        var ranked = CourseRecommender.Rank(Gaps, new[] { course }, RecommendationWeights.Default, limit: 10).Single();

        ranked.Breakdown.EntryLevelFit.Should().Be(10m);
    }

    [Fact]
    public void Rank_CoverageWeightOverridesCoverageTypeDefault()
    {
        // SECONDARY mặc định 0.6, coverage_weight = 100 → hệ số 1.0: 75 × 1 × 1 / 180 × 70 = 29.17
        var course = Course("SEC", null, Teaches(InformationSecurity, 2, "SECONDARY", 100m));

        var ranked = CourseRecommender.Rank(Gaps, new[] { course }, RecommendationWeights.Default, limit: 10).Single();

        ranked.Breakdown.GapPriorityCoverage.Should().Be(29.17m);
    }

    [Fact]
    public void Rank_ExcludesCourseWithZeroScore()
    {
        // Không bắt buộc, coverage_weight 0 → GAP 0, MAND 0; entry không đạt → ENTRY 0 → score 0
        var gap = new RecommendationGap(AiLiteracy, "AI literacy", 2, null, false, 15m, Statuses.SkillGapSeverity.Low);
        var course = Course("ZERO", 3, Teaches(AiLiteracy, 2, "PRIMARY", 0m));

        var ranked = CourseRecommender.Rank(new[] { gap }, new[] { course }, RecommendationWeights.Default, limit: 10);

        ranked.Should().BeEmpty();
    }

    [Fact]
    public void Rank_BuildsReasonsByPriorityAndEnglishExplanation()
    {
        var k1 = CourseRecommender.Rank(Gaps, new[] { K1 }, RecommendationWeights.Default, limit: 10).Single();

        k1.Reasons.Select(r => r.CompetencyId).Should().Equal(DataLiteracy, AiLiteracy);
        k1.Reasons[0].Should().BeEquivalentTo(new
        {
            CurrentLevel = (short?)1,
            RequiredLevel = (short)3,
            CourseTargetLevel = (short)2,
            ClosesSteps = (short)1,
            Mandatory = true,
        });
        k1.Explanation.Should().Be(
            "Raises Data literacy from Basic to Intermediate (required: Advanced, mandatory). "
            + "Raises AI literacy from Basic to Intermediate (required: Intermediate).");
    }

    [Fact]
    public void Rank_UnconfirmedLevelIsDescribedAsNotConfirmed()
    {
        var k2 = CourseRecommender.Rank(Gaps, new[] { K2 }, RecommendationWeights.Default, limit: 10).Single();

        k2.Explanation.Should().Be("Raises Information security from Not confirmed to Intermediate (required: Intermediate, mandatory).");
    }

    [Fact]
    public void Rank_TieBreaksByDurationThenTitle_AndAppliesLimit()
    {
        var slow = Course("B-SLOW", null, Teaches(InformationSecurity, 2)) with { EstimatedDurationMinutes = 600 };
        var fast = Course("C-FAST", null, Teaches(InformationSecurity, 2)) with { EstimatedDurationMinutes = 120 };
        var unknown = Course("A-UNKNOWN", null, Teaches(InformationSecurity, 2)) with { EstimatedDurationMinutes = null };

        var ranked = CourseRecommender.Rank(Gaps, new[] { slow, unknown, fast }, RecommendationWeights.Default, limit: 2);

        ranked.Select(r => r.Course.Code).Should().Equal("C-FAST", "B-SLOW");
    }

    [Fact]
    public void Rank_UsesConfiguredWeights()
    {
        var weights = new RecommendationWeights(GapPriorityCoverage: 50m, MandatoryCoverage: 50m, EntryLevelFit: 0m, Version: "2");

        var k3 = CourseRecommender.Rank(Gaps, new[] { K3 }, weights, limit: 10).Single();

        k3.Score.Should().Be(50m); // 0.5 × 50 + 0.5 × 50 + 1 × 0
    }
}
