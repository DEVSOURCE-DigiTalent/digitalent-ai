using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Intelligence.Analytics;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// GET /intelligence/analytics/overview and /competencies on PostgreSQL. Both analysts are calculated: the analyst
/// (coverage 47.50, 3 gaps, 2 HIGH) and analyst B (no confirmed level: 5 gaps, 4 HIGH).
/// </summary>
[Collection("PostgresIntegration")]
public class SkillGapAnalyticsTests
{
    private static async Task<SkillGapTestWorld> CreateCalculatedWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        var world = await SkillGapTestWorld.CreateAsync(context);
        var hr = world.HrManager();
        var calculate = new CalculateSkillGapUseCase(world.Context, hr, world.Scope(hr), world.RunService(), world.Reader());
        await calculate.ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        await calculate.ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        return world;
    }

    private static AnalyzedEmployees Population(SkillGapTestWorld world, ICurrentUser user) =>
        new(world.Context, world.Scope(user), new LatestSkillGapRuns(world.Context));

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Overview_TotalsAndGroupsWeakestFirst()
    {
        var world = await CreateCalculatedWorldAsync();
        var hr = world.HrManager();

        var overview = await new GetGapOverviewUseCase(world.Context, hr, Population(world, hr))
            .ExecuteAsync(new GetGapOverviewUseCaseInput());

        overview.GroupBy.Should().Be("department");
        overview.Totals.Should().BeEquivalentTo(new { Employees = 2, TotalGaps = 8, HighCount = 6, EmployeesWithHigh = 2 });
        overview.Groups.Select(g => g.Name).Should().Equal("Finance", "Analytics");
        overview.Groups.Last().AverageCoverage.Should().Be(47.50m);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Overview_ByGradeUsesOrganizationGradeNamesAndDepartmentManagerSeesOwnDepartment()
    {
        var world = await CreateCalculatedWorldAsync();
        world.DataAnalyst.JobGrade = JobGrades.G2;
        await world.Context.SaveChangesAsync();
        var hr = world.HrManager();
        var managerOfA = world.ManagerOf(world.DepartmentA);

        var byGrade = await new GetGapOverviewUseCase(world.Context, hr, Population(world, hr))
            .ExecuteAsync(new GetGapOverviewUseCaseInput { GroupBy = "grade" });
        var scoped = await new GetGapOverviewUseCase(world.Context, managerOfA, Population(world, managerOfA))
            .ExecuteAsync(new GetGapOverviewUseCaseInput());

        byGrade.Groups.Should().ContainSingle().Which.Should().BeEquivalentTo(new
        {
            Id = "G2",
            Name = JobGrades.Defaults[JobGrades.G2].Name,
            Employees = 2,
        });
        scoped.Totals.Employees.Should().Be(1);
        scoped.Groups.Select(g => g.Name).Should().Equal("Analytics");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Competencies_CountGapsPerCompetencyMostHighFirst()
    {
        var world = await CreateCalculatedWorldAsync();
        var hr = world.HrManager();

        var rows = await new GetCompetencyGapsUseCase(world.Context, Population(world, hr))
            .ExecuteAsync(new GetCompetencyGapsUseCaseInput());

        rows.Should().HaveCount(5);
        rows.Take(2).Should().OnlyContain(r => r.HighCount == 2);
        rows.Single(r => r.CompetencyId == world.Competencies["DATA_LITERACY"].Id).Should().BeEquivalentTo(new
        {
            EmployeesRequired = 2,
            EmployeesWithGap = 2,
            HighCount = 2,
            AverageRequiredLevel = 3m,
            AverageCurrentLevel = 0.5m,
        });
        rows.Single(r => r.CompetencyId == world.Competencies["PROBLEM_SOLVING"].Id).EmployeesWithGap.Should().Be(1, "the analyst already meets it");
    }
}
