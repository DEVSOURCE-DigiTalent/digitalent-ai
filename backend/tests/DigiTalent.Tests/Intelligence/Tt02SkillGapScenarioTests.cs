using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Kịch bản demo §8 của docs/specs/2026-09-29-tt02-position-competency-matrix.md, số liệu tính tay ở
/// spec Sprint 3 §4.5 (bản TT02): Kế toán, mọi năng lực đã xác nhận mức Cơ bản.
/// </summary>
public class Tt02SkillGapScenarioTests
{
    private sealed record Line(string SourceCode, int Domain, SkillGapRequirementLine Requirement);

    private static List<Line> AccountantRequirements()
    {
        var accountant = Tt02Catalog.Positions.Single(p => p.Code == "ACCOUNTANT");
        var weights = Tt02Catalog.WeightsByDomain(Tt02Catalog.Domains.Select(d => d.Competencies.Length).ToList());
        return Tt02Catalog.Domains
            .SelectMany((domain, d) => domain.Competencies.Select((competency, c) => new Line(
                competency.SourceCode,
                domain.Number,
                new SkillGapRequirementLine(Guid.NewGuid(), accountant.DomainLevels[d], weights[d][c], accountant.IsMandatoryDomain(domain.Number)))))
            .ToList();
    }

    private static Dictionary<Guid, short> AllBasic(IEnumerable<Line> lines) =>
        lines.ToDictionary(l => l.Requirement.CompetencyId, _ => (short)1);

    [Fact]
    public void Accountant_AllBasic_Domains1And4AreHigh_Domains2_5_6AreLow_Domain3IsMet()
    {
        var lines = AccountantRequirements();

        var result = SkillGapCalculator.Calculate(lines.Select(l => l.Requirement).ToList(), AllBasic(lines), SkillGapSettings.Default);

        var byCode = result.Items.Zip(lines, (item, line) => (line.Domain, line.SourceCode, item)).ToList();
        byCode.Where(x => x.Domain is 1 or 4).Should().OnlyContain(x => x.item.Severity == Statuses.SkillGapSeverity.High);
        byCode.Where(x => x.Domain is 2 or 5 or 6).Should().OnlyContain(x => x.item.Severity == Statuses.SkillGapSeverity.Low);
        byCode.Where(x => x.Domain == 3).Should().OnlyContain(x => x.item.Severity == null);

        result.Summary.Should().BeEquivalentTo(new SkillGapSummary(
            TotalRequired: 24, TotalMet: 4, TotalGap: 20, HighCount: 7, MediumCount: 0, LowCount: 13, CoveragePercent: 52.78m));
        byCode.Single(x => x.SourceCode == "1.1").item.PriorityScore.Should().Be(16.68m); // 2 × 5.56 × 1.5
        byCode.Single(x => x.SourceCode == "4.2").item.PriorityScore.Should().Be(12.51m); // 2 × 4.17 × 1.5
        byCode.Single(x => x.SourceCode == "6.3").item.PriorityScore.Should().Be(5.55m);  // 1 × 5.55 × 1
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
        item42.PriorityScore.Should().Be(6.26m); // 1 × 4.17 × 1.5 = 6.255 → 6.26
        result.Summary.HighCount.Should().Be(6);
        result.Summary.MediumCount.Should().Be(1);
        result.Summary.CoveragePercent.Should().Be(54.17m);
    }
}
