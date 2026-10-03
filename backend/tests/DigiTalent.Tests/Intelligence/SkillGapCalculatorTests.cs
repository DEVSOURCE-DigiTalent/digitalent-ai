using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Golden tests theo ví dụ tính tay §4.5 của docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md.
/// </summary>
public class SkillGapCalculatorTests
{
    private static readonly Guid DataLiteracy = Guid.NewGuid();
    private static readonly Guid DigitalCommunication = Guid.NewGuid();
    private static readonly Guid InformationSecurity = Guid.NewGuid();
    private static readonly Guid AiLiteracy = Guid.NewGuid();
    private static readonly Guid ProblemSolving = Guid.NewGuid();

    private static readonly SkillGapRequirementLine[] DataAnalystRequirements =
    {
        new(DataLiteracy, 3, 30m, true),
        new(DigitalCommunication, 2, 20m, false),
        new(InformationSecurity, 2, 25m, true),
        new(AiLiteracy, 2, 15m, false),
        new(ProblemSolving, 1, 10m, false),
    };

    private static readonly Dictionary<Guid, short> EmployeeConfirmedLevels = new()
    {
        [DataLiteracy] = 1,
        [DigitalCommunication] = 2,
        [AiLiteracy] = 1,
        [ProblemSolving] = 3,
    };

    [Fact]
    public void Calculate_GoldenExample_ProducesExpectedLines()
    {
        var result = SkillGapCalculator.Calculate(DataAnalystRequirements, EmployeeConfirmedLevels, SkillGapSettings.Default);

        var lines = result.Items.ToDictionary(i => i.CompetencyId);
        lines[DataLiteracy].Should().BeEquivalentTo(new { CurrentLevel = (short?)1, GapSteps = (short)2, MandatoryMultiplier = 1.5m, PriorityScore = 90.00m, Severity = Statuses.SkillGapSeverity.High });
        lines[DigitalCommunication].Should().BeEquivalentTo(new { CurrentLevel = (short?)2, GapSteps = (short)0, MandatoryMultiplier = 1.00m, PriorityScore = 0m, Severity = (string?)null });
        lines[InformationSecurity].Should().BeEquivalentTo(new { CurrentLevel = (short?)null, GapSteps = (short)2, MandatoryMultiplier = 1.5m, PriorityScore = 75.00m, Severity = Statuses.SkillGapSeverity.High });
        lines[AiLiteracy].Should().BeEquivalentTo(new { CurrentLevel = (short?)1, GapSteps = (short)1, MandatoryMultiplier = 1.00m, PriorityScore = 15.00m, Severity = Statuses.SkillGapSeverity.Low });
        lines[ProblemSolving].Should().BeEquivalentTo(new { CurrentLevel = (short?)3, GapSteps = (short)0, PriorityScore = 0m, Severity = (string?)null });
    }

    [Fact]
    public void Calculate_GoldenExample_ProducesExpectedSummary()
    {
        var result = SkillGapCalculator.Calculate(DataAnalystRequirements, EmployeeConfirmedLevels, SkillGapSettings.Default);

        result.Summary.Should().BeEquivalentTo(new SkillGapSummary(
            TotalRequired: 5, TotalMet: 2, TotalGap: 3, HighCount: 2, MediumCount: 0, LowCount: 1, CoveragePercent: 47.50m));
    }

    [Fact]
    public void Calculate_WithoutAnyConfirmedLevel_GapEqualsRequiredLevel()
    {
        var result = SkillGapCalculator.Calculate(DataAnalystRequirements, new Dictionary<Guid, short>(), SkillGapSettings.Default);

        result.Items.Should().OnlyContain(i => i.CurrentLevel == null && i.GapSteps == i.RequiredLevel);
        result.Summary.TotalMet.Should().Be(0);
        result.Summary.CoveragePercent.Should().Be(0m);
    }

    [Fact]
    public void Calculate_WhenConfirmedExceedsRequired_IsMetWithZeroPriority()
    {
        var requirements = new[] { new SkillGapRequirementLine(DataLiteracy, 2, 100m, true) };
        var confirmed = new Dictionary<Guid, short> { [DataLiteracy] = 3 };

        var line = SkillGapCalculator.Calculate(requirements, confirmed, SkillGapSettings.Default).Items.Single();

        line.GapSteps.Should().Be(0);
        line.PriorityScore.Should().Be(0m);
        line.Severity.Should().BeNull();
    }

    // D-B1 (29/09/2026): mức nghiêm trọng chỉ dựa vào số mức thiếu, trọng số không còn ảnh hưởng
    [Theory]
    [InlineData(3, 1, 4.17, false, "HIGH")]   // thiếu 2 mức, không bắt buộc
    [InlineData(3, 1, 4.17, true, "HIGH")]    // thiếu 2 mức, bắt buộc
    [InlineData(2, 1, 4.17, true, "MEDIUM")]  // thiếu 1 mức, bắt buộc
    [InlineData(2, 1, 50, false, "LOW")]      // thiếu 1 mức, không bắt buộc — dù trọng số lớn
    public void Calculate_ClassifiesSeverityByMissingLevelsOnly(int required, short confirmed, double weight, bool mandatory, string expected)
    {
        var requirements = new[] { new SkillGapRequirementLine(DataLiteracy, required, (decimal)weight, mandatory) };
        var confirmedLevels = new Dictionary<Guid, short> { [DataLiteracy] = confirmed };

        var line = SkillGapCalculator.Calculate(requirements, confirmedLevels, SkillGapSettings.Default).Items.Single();

        line.Severity.Should().Be(expected);
    }

    [Fact]
    public void Calculate_UsesConfiguredMultiplier()
    {
        var settings = new SkillGapSettings(MandatoryMultiplier: 2m);
        var requirements = new[]
        {
            new SkillGapRequirementLine(DataLiteracy, 2, 30m, true),
            new SkillGapRequirementLine(AiLiteracy, 2, 15m, false),
        };

        var lines = SkillGapCalculator.Calculate(requirements, new Dictionary<Guid, short> { [AiLiteracy] = 1 }, settings)
            .Items.ToDictionary(i => i.CompetencyId);

        lines[DataLiteracy].MandatoryMultiplier.Should().Be(2m);
        lines[DataLiteracy].PriorityScore.Should().Be(120m); // 2 × 30 × 2
        lines[AiLiteracy].Severity.Should().Be(Statuses.SkillGapSeverity.Low);
    }

    [Fact]
    public void Calculate_RoundsPriorityAwayFromZero()
    {
        // 1 × 12.35 × 1.5 = 18.525 → 18.53 (banker's rounding sẽ cho 18.52)
        var requirements = new[] { new SkillGapRequirementLine(DataLiteracy, 1, 12.35m, true) };

        var line = SkillGapCalculator.Calculate(requirements, new Dictionary<Guid, short>(), SkillGapSettings.Default).Items.Single();

        line.PriorityScore.Should().Be(18.53m);
    }

    [Fact]
    public void Calculate_PreservesRequirementOrder()
    {
        var result = SkillGapCalculator.Calculate(DataAnalystRequirements, EmployeeConfirmedLevels, SkillGapSettings.Default);

        result.Items.Select(i => i.CompetencyId).Should().Equal(DataAnalystRequirements.Select(r => r.CompetencyId));
    }
}
