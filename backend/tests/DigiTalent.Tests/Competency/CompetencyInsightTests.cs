using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Competency;

/// <summary>
/// Competency matrix (OW-19), competency usage (OW-15) and position requirement summaries (OW-16) on PostgreSQL.
/// Uses the skill gap world: Data Analyst requires 5 competencies; the analyst holds 4 levels, analyst B none.
/// </summary>
[Collection("PostgresIntegration")]
public class CompetencyInsightTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static GetCompetencyMatrixUseCase Matrix(SkillGapTestWorld world, ICurrentUser user) =>
        new(world.Context, user, world.Scope(user), new LatestSkillGapRuns(world.Context));

    private static GetCompetencyUsageUseCase Usage(SkillGapTestWorld world, ICurrentUser user) => new(world.Context, user, world.Scope(user));

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Matrix_ColumnsAreFrameworkCompetenciesAndCellsCompareLevels()
    {
        var world = await CreateWorldAsync();
        await Tt02TestData.MapAsync(world.Context, new Dictionary<Guid, string>
        {
            [world.Competencies["INFORMATION_SECURITY"].Id] = "4.2",
            [world.Competencies["DATA_LITERACY"].Id] = "1.10",
        });

        var matrix = await Matrix(world, world.HrManager()).ExecuteAsync(new GetCompetencyMatrixUseCaseInput());

        matrix.Competencies.Select(c => c.FrameworkCode).Should().Equal("1.10", "4.2");
        matrix.Categories.Should().ContainSingle();
        matrix.Employees.Should().HaveCount(4, "inactive employees are not in the matrix");
        var analyst = matrix.Employees.Single(e => e.EmployeeId == world.Analyst.Id);
        var dataLiteracy = analyst.Cells[world.Competencies["DATA_LITERACY"].Id.ToString()];
        dataLiteracy.Should().BeEquivalentTo(new { CurrentLevel = (short)1, RequiredLevel = 3, Gap = 2, EvidenceStatus = "CONFIRMED" });
        var security = analyst.Cells[world.Competencies["INFORMATION_SECURITY"].Id.ToString()];
        security.Should().BeEquivalentTo(new { CurrentLevel = (short)0, RequiredLevel = 2, Gap = 2, EvidenceStatus = "NONE" });
        analyst.TotalGaps.Should().Be(2);
        analyst.CoveragePercent.Should().BeNull("no skill gap was calculated");
        matrix.Employees.Single(e => e.EmployeeId == world.Unassigned.Id).TotalGaps.Should().Be(0);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Matrix_FiltersByGradeAndScope()
    {
        var world = await CreateWorldAsync();
        world.DataAnalyst.JobGrade = JobGrades.G2;
        await world.Context.SaveChangesAsync();

        var byGrade = await Matrix(world, world.HrManager()).ExecuteAsync(new GetCompetencyMatrixUseCaseInput { JobGrade = "g2" });
        var managerOfA = await Matrix(world, world.ManagerOf(world.DepartmentA)).ExecuteAsync(new GetCompetencyMatrixUseCaseInput());

        byGrade.Employees.Select(e => e.EmployeeId).Should().BeEquivalentTo(new[] { world.Analyst.Id, world.AnalystInDepartmentB.Id });
        managerOfA.Employees.Select(e => e.EmployeeId).Should().BeEquivalentTo(new[] { world.Analyst.Id, world.Unassigned.Id });
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Usage_ListsRequiringPositionsLevelSpreadAndShortfalls()
    {
        var world = await CreateWorldAsync();
        var dataLiteracy = world.Competencies["DATA_LITERACY"];

        var usage = await Usage(world, world.HrManager()).ExecuteAsync(new GetCompetencyUsageUseCaseInput { CompetencyId = dataLiteracy.Id });

        usage.Positions.Should().ContainSingle().Which.Should().BeEquivalentTo(new
        {
            PositionId = world.DataAnalyst.Id,
            RequiredLevel = 3,
            IsMandatory = true,
            WeightPercent = 30m,
            Employees = 2,
        });
        usage.LevelDistribution.Should().Equal(new Dictionary<string, int> { ["0"] = 3, ["1"] = 1, ["2"] = 0, ["3"] = 0 });
        usage.EmployeesWithGap.Select(e => (e.EmployeeId, e.Gap)).Should().Equal((world.AnalystInDepartmentB.Id, 3), (world.Analyst.Id, 2));
        usage.Courses.Should().BeEmpty();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Usage_ShowsOnlyEmployeesInScopeAndRejectsUnknownCompetency()
    {
        var world = await CreateWorldAsync();
        var dataLiteracy = world.Competencies["DATA_LITERACY"];

        var managerOfB = await Usage(world, world.ManagerOf(world.DepartmentB))
            .ExecuteAsync(new GetCompetencyUsageUseCaseInput { CompetencyId = dataLiteracy.Id });
        var unknown = () => Usage(world, world.HrManager()).ExecuteAsync(new GetCompetencyUsageUseCaseInput { CompetencyId = Guid.NewGuid() });

        managerOfB.EmployeesWithGap.Select(e => e.EmployeeId).Should().Equal(world.AnalystInDepartmentB.Id);
        managerOfB.Positions.Single().Employees.Should().Be(1);
        await unknown.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Summaries_ReportActiveDraftAndUnconfiguredPositions()
    {
        var world = await CreateWorldAsync();
        var hr = world.HrManager();
        world.Context.PositionRequirementSets.Add(new PositionRequirementSet
        {
            JobPositionId = world.PositionWithoutActiveSet.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Draft,
            CreatedByUserId = world.Context.Users.First(u => u.OrganizationId == world.Organization.Id).Id,
        });
        await world.Context.SaveChangesAsync();

        var summaries = await new GetPositionRequirementSummariesUseCase(world.Context, hr)
            .ExecuteAsync(new GetPositionRequirementSummariesUseCaseInput());

        summaries.Should().HaveCount(2);
        var analyst = summaries.Single(s => s.JobPositionId == world.DataAnalyst.Id);
        analyst.Status.Should().Be("ACTIVE");
        analyst.ActiveSet!.CompetencyCount.Should().Be(5);
        analyst.EmployeeCount.Should().Be(2, "the inactive analyst is not counted");
        analyst.TotalVersions.Should().Be(1);
        var clerk = summaries.Single(s => s.JobPositionId == world.PositionWithoutActiveSet.Id);
        clerk.Status.Should().Be("DRAFT");
        clerk.ActiveSet.Should().BeNull();
        clerk.DraftSet!.CompetencyCount.Should().Be(0);
    }
}
