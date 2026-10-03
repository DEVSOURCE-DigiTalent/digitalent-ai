using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Kịch bản demo §8 của docs/specs/2026-09-29-tt02-position-competency-matrix.md, số liệu tính tay ở
/// spec Sprint 3 §4.5.1: Kế toán (21 năng lực theo ma trận từng năng lực, D-B7), mọi năng lực đã xác nhận mức Cơ bản.
/// </summary>
public class Tt02SkillGapScenarioTests
{
    private sealed record Line(string SourceCode, SkillGapRequirementLine Requirement);

    private static List<Line> AccountantRequirements() =>
        Tt02Catalog.RequirementsFor(Tt02Catalog.Positions.Single(p => p.Code == "ACCOUNTANT"))
            .Select(r => new Line(r.SourceCode, new SkillGapRequirementLine(Guid.NewGuid(), r.RequiredLevel, r.WeightPercent, r.Mandatory)))
            .ToList();

    private static Dictionary<Guid, short> AllBasic(IEnumerable<Line> lines) =>
        lines.ToDictionary(l => l.Requirement.CompetencyId, _ => (short)1);

    [Fact]
    public void Accountant_AllBasic_SeverityFollowsMissingLevelsPerCompetency()
    {
        var lines = AccountantRequirements();

        var result = SkillGapCalculator.Calculate(lines.Select(l => l.Requirement).ToList(), AllBasic(lines), SkillGapSettings.Default);

        var byCode = result.Items.Zip(lines, (item, line) => (line.SourceCode, item)).ToDictionary(x => x.SourceCode, x => x.item);
        new[] { "1.2", "1.3", "2.3", "4.2" }.Should().OnlyContain(code => byCode[code].Severity == Statuses.SkillGapSeverity.High);
        byCode["4.1"].Severity.Should().Be(Statuses.SkillGapSeverity.Medium); // thiếu 1 mức, năng lực lõi bắt buộc
        new[] { "1.1", "2.1", "2.2", "2.4", "2.6", "3.4", "5.2", "5.3", "6.2", "6.3" }
            .Should().OnlyContain(code => byCode[code].Severity == Statuses.SkillGapSeverity.Low);
        new[] { "2.5", "3.1", "4.3", "5.1", "5.4", "6.1" }.Should().OnlyContain(code => byCode[code].Severity == null);

        result.Summary.Should().BeEquivalentTo(new SkillGapSummary(
            TotalRequired: 21, TotalMet: 6, TotalGap: 15, HighCount: 4, MediumCount: 1, LowCount: 10, CoveragePercent: 62.03m));
        byCode["1.2"].PriorityScore.Should().Be(16.68m); // 2 × 5.56 × 1.5
        byCode["2.3"].PriorityScore.Should().Be(8.34m);  // 2 × 2.78 × 1.5
        byCode["4.1"].PriorityScore.Should().Be(8.34m);  // 1 × 5.56 × 1.5
        byCode["3.4"].PriorityScore.Should().Be(8.33m);  // 1 × 8.33 × 1
    }

    [Fact]
    public void Accountant_Confirming42AtIntermediate_TurnsItFromHighToMedium()
    {
        var lines = AccountantRequirements();
        var confirmed = AllBasic(lines);
        var line42 = lines.Single(l => l.SourceCode == "4.2");
        confirmed[line42.Requirement.CompetencyId] = 2;

        var result = SkillGapCalculator.Calculate(lines.Select(l => l.Requirement).ToList(), confirmed, SkillGapSettings.Default);

        var item42 = result.Items.Single(i => i.CompetencyId == line42.Requirement.CompetencyId);
        item42.Severity.Should().Be(Statuses.SkillGapSeverity.Medium);
        item42.PriorityScore.Should().Be(8.34m); // 1 × 5.56 × 1.5
        result.Summary.HighCount.Should().Be(3);
        result.Summary.MediumCount.Should().Be(2);
        result.Summary.CoveragePercent.Should().Be(63.89m);
    }
}
