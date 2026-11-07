using DigiTalent.Application.UseCases.TrialProgram;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Trial;

/// <summary>Luật đề xuất phạm vi đào tạo từ kết quả trắc nghiệm (docs/specs/2026-10-31-trial-ai-report-roadmap.md §3).</summary>
public class TrialCeilingPlannerTests
{
    private static readonly Guid Accounting = Guid.NewGuid();
    private static readonly Guid Marketing = Guid.NewGuid();

    private static TrialPlanPerson Person(Guid department, params int[] levels) => new(department, levels);

    [Fact]
    public void More_than_half_below_basic_or_median_zero_holds_basic_otherwise_one_level_above_the_median()
    {
        var people = new[]
        {
            Person(Accounting, 0, 1, 2, 3),
            Person(Accounting, 0, 1, 2, 3),
            Person(Marketing, 0, 0, 2, 3),
            Person(Marketing, 1, 2, 3, 3),
        };

        var plan = TrialCeilingPlanner.Plan(people, 4);

        plan.Domains.Select(d => d.SuggestedLevel).Should().Equal(1, 2, 3, 3);
        plan.Domains.Select(d => d.Reason).Should().Equal(
            TrialCeilingPlanner.ReasonBelowBasic, TrialCeilingPlanner.ReasonRaise, TrialCeilingPlanner.ReasonRaise, TrialCeilingPlanner.ReasonAtMax);
        plan.Domains[0].BelowBasic.Should().Be(3);
        plan.Domains[1].Median.Should().Be(1);
    }

    [Fact]
    public void Exactly_half_below_basic_uses_the_lower_median()
    {
        var plan = TrialCeilingPlanner.Plan(new[] { Person(Accounting, 0), Person(Accounting, 0), Person(Accounting, 2), Person(Accounting, 2) }, 1);

        plan.Domains[0].Median.Should().Be(0);
        plan.Domains[0].SuggestedLevel.Should().Be(1);
        plan.Domains[0].Reason.Should().Be(TrialCeilingPlanner.ReasonMedianZero);
    }

    [Fact]
    public void Departments_get_their_own_level_only_when_lower_than_the_organization()
    {
        var people = new[]
        {
            Person(Accounting, 0, 2),
            Person(Accounting, 0, 2),
            Person(Marketing, 2, 2),
            Person(Marketing, 2, 2),
            Person(Marketing, 2, 2),
        };

        var balanced = TrialCeilingPlanner.Plan(people, 2).Balanced;

        balanced.Organization.Should().Equal(3, 3);
        balanced.Departments.Should().ContainSingle(d => d.DepartmentId == Accounting)
            .Which.Levels.Should().Equal(1, null);
    }

    [Fact]
    public void Options_saving_raises_the_two_weakest_raisable_domains_and_full_opens_everything()
    {
        var people = new[] { Person(Accounting, 1, 1, 2, 0), Person(Accounting, 1, 2, 2, 0) };

        var plan = TrialCeilingPlanner.Plan(people, 4);

        plan.Options.Single(o => o.Kind == TrialCeilingPlanner.OptionSaving).Organization.Should().Equal(2, 2, 1, 1);
        plan.Options.Single(o => o.Kind == TrialCeilingPlanner.OptionFull).Organization.Should().Equal(3, 3, 3, 3);
        plan.Balanced.Organization.Should().Equal(2, 2, 3, 1);
    }

    [Fact]
    public void Nobody_assessed_holds_basic_everywhere()
    {
        var plan = TrialCeilingPlanner.Plan(Array.Empty<TrialPlanPerson>(), 3);

        plan.Domains.Should().OnlyContain(d => d.SuggestedLevel == 1 && d.People == 0);
        plan.Balanced.Departments.Should().BeEmpty();
    }
}
