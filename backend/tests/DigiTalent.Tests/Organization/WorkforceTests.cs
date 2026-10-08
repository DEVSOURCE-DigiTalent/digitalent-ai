using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Organization.Workforce;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Organization;

/// <summary>
/// GET /workforce and GET /workforce/{employeeId} on PostgreSQL (LINQ translation of the scoped, correlated queries).
/// World: Data Analyst requirement set of 5 competencies; analyst (dept A, partial profile), analyst B (dept B, no
/// profile), a new joiner without position, an inactive analyst and a clerk whose position has no active set.
/// </summary>
[Collection("PostgresIntegration")]
public class WorkforceTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static async Task CalculateAsync(SkillGapTestWorld world, params Employee[] employees)
    {
        var hr = world.HrManager();
        var useCase = new CalculateSkillGapUseCase(world.Context, hr, world.Scope(hr), world.RunService(), world.Reader());
        foreach (var employee in employees)
        {
            await useCase.ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = employee.Id });
        }
    }

    private static WorkforceReader Reader(SkillGapTestWorld world) => new(world.Context, new LatestSkillGapRuns(world.Context));

    private static GetWorkforceUseCase List(SkillGapTestWorld world, ICurrentUser user) => new(world.Scope(user), Reader(world));

    private static GetEmployeeCapabilityUseCase Detail(SkillGapTestWorld world, ICurrentUser user) =>
        new(world.Context, world.Scope(user), Reader(world), world.Reader(), new MyTaskReader(world.Context));

    [Fact]
    [Trait("Category", "Integration")]
    public async Task List_ReturnsBlockersSnapshotsAndMostAtRiskFirst()
    {
        var world = await CreateWorldAsync();
        await CalculateAsync(world, world.Analyst, world.AnalystInDepartmentB);

        var result = await List(world, world.HrManager()).ExecuteAsync(new GetWorkforceUseCaseInput { PageSize = 100 });

        result.TotalItems.Should().Be(5, "ACTIVE and INACTIVE employees are listed by default");
        result.Items.Select(r => r.Id).Take(2).Should().Equal(world.AnalystInDepartmentB.Id, world.Analyst.Id);
        var analyst = result.Items.Single(r => r.Id == world.Analyst.Id);
        analyst.Blocker.Should().BeNull();
        analyst.HasSnapshot.Should().BeTrue();
        analyst.CoveragePercent.Should().Be(47.50m);
        analyst.GapCount.Should().Be(3);
        analyst.HighCount.Should().Be(2);
        analyst.DepartmentName.Should().Be("Analytics");
        analyst.PositionName.Should().Be("Data Analyst");
        result.Items.Single(r => r.Id == world.Unassigned.Id).Blocker.Should().Be(SkillGapSkipReasons.NoJobPosition);
        result.Items.Single(r => r.Id == world.Inactive.Id).Blocker.Should().Be(SkillGapSkipReasons.EmployeeNotActive);
        result.Items.Single(r => r.Id == world.NoActiveSetEmployee.Id).Blocker.Should().Be(SkillGapSkipReasons.NoActiveRequirementSet);
        result.Items.Single(r => r.Id == world.Unassigned.Id).HasSnapshot.Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task List_FiltersByGapAndKeepsDepartmentManagerInOwnDepartment()
    {
        var world = await CreateWorldAsync();
        await CalculateAsync(world, world.Analyst);

        var unknown = await List(world, world.HrManager()).ExecuteAsync(new GetWorkforceUseCaseInput { Gap = "UNKNOWN", PageSize = 100 });
        var high = await List(world, world.HrManager()).ExecuteAsync(new GetWorkforceUseCaseInput { Gap = "high", PageSize = 100 });
        var managerOfB = await List(world, world.ManagerOf(world.DepartmentB)).ExecuteAsync(new GetWorkforceUseCaseInput { PageSize = 100 });

        unknown.Items.Should().NotContain(r => r.Id == world.Analyst.Id).And.HaveCount(4);
        high.Items.Select(r => r.Id).Should().Equal(world.Analyst.Id);
        managerOfB.Items.Select(r => r.Id).Should().BeEquivalentTo(new[] { world.NoActiveSetEmployee.Id, world.AnalystInDepartmentB.Id });
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Detail_ReturnsRequiredAndConfirmedLevelsSnapshotAndEvidenceSource()
    {
        var world = await CreateWorldAsync();
        await CalculateAsync(world, world.Analyst);
        await ConfirmManuallyAsync(world, "PROBLEM_SOLVING", level: 3);

        var capability = await Detail(world, world.HrManager()).ExecuteAsync(new GetEmployeeCapabilityUseCaseInput { EmployeeId = world.Analyst.Id });

        capability.Employee.FullName.Should().Be(world.Analyst.FullName);
        capability.Summary.CoveragePercent.Should().Be(47.50m);
        capability.Competencies.Should().HaveCount(5, "every competency the position requires is listed");
        var dataLiteracy = capability.Competencies.Single(c => c.CompetencyId == world.Competencies["DATA_LITERACY"].Id);
        dataLiteracy.CurrentLevel.Should().Be(1);
        dataLiteracy.RequiredLevel.Should().Be(3);
        capability.Competencies.Single(c => c.CompetencyId == world.Competencies["INFORMATION_SECURITY"].Id).CurrentLevel.Should().BeNull();
        capability.Competencies.Single(c => c.CompetencyId == world.Competencies["PROBLEM_SOLVING"].Id).Source.Should().Be("MANUAL");
        capability.SkillGap.Should().NotBeNull();
        capability.SkillGap!.Summary.CoveragePercent.Should().Be(47.50m);
        capability.SkillGap.Items.Should().HaveCount(5);
        capability.Evidence.Should().HaveCount(4);
        capability.Evidence.First().CompetencyId.Should().Be(world.Competencies["PROBLEM_SOLVING"].Id, "the latest confirmation comes first");
        capability.Learning.Should().BeEmpty();
        capability.Tasks.Should().BeEmpty();
        capability.Recommendations.Should().BeEmpty();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Detail_OutOfScope_Returns404()
    {
        var world = await CreateWorldAsync();

        var act = () => Detail(world, world.ManagerOf(world.DepartmentB))
            .ExecuteAsync(new GetEmployeeCapabilityUseCaseInput { EmployeeId = world.Analyst.Id });

        await act.Should().ThrowAsync<NotFoundException>();
    }

    /// <summary>A manual confirmation newer than the world's profile: updates the level and links the confirming evidence.</summary>
    private static async Task ConfirmManuallyAsync(SkillGapTestWorld world, string competencyCode, short level)
    {
        var reviewer = new User
        {
            OrganizationId = world.Organization.Id,
            Email = $"reviewer_{Guid.NewGuid():N}@test.local",
            PasswordHash = "x",
            DisplayName = "Reviewer",
        };
        var evidence = new CompetencyEvidence
        {
            EmployeeId = world.Analyst.Id,
            CompetencyId = world.Competencies[competencyCode].Id,
            SourceType = Statuses.EvidenceSourceType.ManualOverride,
            Status = Statuses.EvidenceStatus.Confirmed,
            IsLevelConfirming = true,
            ConfirmedLevel = level,
            ConfirmedByUserId = reviewer.Id,
            ConfirmedAt = DateTimeOffset.UtcNow.AddMinutes(1),
            ReviewNote = "Owner confirmed",
        };
        world.Context.Users.Add(reviewer);
        world.Context.CompetencyEvidences.Add(evidence);
        var profile = world.Context.EmployeeCompetencyProfiles
            .Single(p => p.EmployeeId == world.Analyst.Id && p.CompetencyId == evidence.CompetencyId);
        profile.ConfirmedLevel = level;
        profile.ConfirmedAt = evidence.ConfirmedAt.Value;
        profile.LatestConfirmingEvidenceId = evidence.Id;
        await world.Context.SaveChangesAsync();
    }
}
