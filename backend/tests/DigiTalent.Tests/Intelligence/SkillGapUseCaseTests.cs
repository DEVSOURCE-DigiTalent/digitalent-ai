using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Chạy trên PostgreSQL thật: bắt được lỗi dịch LINQ → SQL và vi phạm CHECK constraint mà InMemory bỏ qua.
/// </summary>
[Collection("PostgresIntegration")]
public class SkillGapUseCaseTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static CalculateSkillGapUseCase Calculate(SkillGapTestWorld world, ICurrentUser user) =>
        new(world.Context, user, world.Scope(user), world.RunService(), world.Reader());

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Calculate_GoldenExample_PersistsSnapshotAndReturnsSortedDetail()
    {
        var world = await CreateWorldAsync();

        var detail = await Calculate(world, world.HrManager())
            .ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });

        detail.GeneratedBy.Should().Be(Statuses.SkillGapGeneratedBy.UserRequest);
        detail.CalculationVersion.Should().Be(SkillGapCalculator.CalculationVersion);
        detail.GapCount.Should().Be(3);
        detail.JobPositionName.Should().Be("Data Analyst");
        detail.DepartmentName.Should().Be("Analytics");
        detail.Summary.CoveragePercent.Should().Be(47.50m);
        detail.Summary.Config.MandatoryMultiplier.Should().Be(1.5m);
        detail.Items.Select(i => i.PriorityScore).Should().Equal(90m, 75m, 15m, 0m, 0m);
        detail.Items.Single(i => i.CompetencyCode == "INFORMATION_SECURITY").CurrentLevel.Should().BeNull();

        var storedItems = await world.Context.SkillGapItems.AsNoTracking().CountAsync(i => i.SkillGapRunId == detail.RunId);
        storedItems.Should().Be(5);
    }

    [Theory]
    [Trait("Category", "Integration")]
    [InlineData("Unassigned", SkillGapSkipReasons.NoJobPosition)]
    [InlineData("Inactive", SkillGapSkipReasons.EmployeeNotActive)]
    [InlineData("NoActiveSetEmployee", SkillGapSkipReasons.NoActiveRequirementSet)]
    public async Task Calculate_WhenNotApplicable_Returns400WithReasonAndStoresNothing(string employeeName, string expectedReason)
    {
        var world = await CreateWorldAsync();
        var employee = employeeName switch
        {
            "Unassigned" => world.Unassigned,
            "Inactive" => world.Inactive,
            _ => world.NoActiveSetEmployee,
        };

        var act = () => Calculate(world, world.HrManager()).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = employee.Id });

        var error = await act.Should().ThrowAsync<BadRequestException>();
        error.Which.Errors.Should().ContainSingle(e => e.Field == "employeeId" && e.Code == expectedReason);
        (await world.Context.SkillGapRuns.AnyAsync(r => r.EmployeeId == employee.Id)).Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task DepartmentManager_CannotCalculateOrReadOtherDepartment()
    {
        var world = await CreateWorldAsync();
        var hrRun = await Calculate(world, world.HrManager())
            .ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        var managerA = world.ManagerOf(world.DepartmentA);

        var calculate = () => Calculate(world, managerA).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        var read = () => new GetSkillGapRunByIdUseCase(world.Scope(managerA), world.Reader())
            .ExecuteAsync(new GetSkillGapRunByIdUseCaseInput { RunId = hrRun.RunId });

        await calculate.Should().ThrowAsync<NotFoundException>();
        await read.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Employee_ReadsOwnLatestOnly()
    {
        var world = await CreateWorldAsync();
        var hr = world.HrManager();
        await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        var latest = await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        var otherRun = await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        var self = world.EmployeeSelf(world.Analyst);

        var mine = await new GetMyLatestSkillGapUseCase(self, world.Scope(self), world.Reader())
            .ExecuteAsync(new GetMyLatestSkillGapUseCaseInput());
        var readOther = () => new GetSkillGapRunByIdUseCase(world.Scope(self), world.Reader())
            .ExecuteAsync(new GetSkillGapRunByIdUseCaseInput { RunId = otherRun.RunId });

        mine!.RunId.Should().Be(latest.RunId);
        await readOther.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetMyLatest_ReturnsNull_WhenAccountHasNoEmployeeProfile()
    {
        var world = await CreateWorldAsync();
        var hr = world.HrManager(); // mock HR không có EmployeeId

        var mine = await new GetMyLatestSkillGapUseCase(hr, world.Scope(hr), world.Reader())
            .ExecuteAsync(new GetMyLatestSkillGapUseCaseInput());

        mine.Should().BeNull();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Batch_ForOwnDepartment_CalculatesActiveAndReportsSkipped()
    {
        var world = await CreateWorldAsync();
        var managerA = world.ManagerOf(world.DepartmentA);

        var result = await new CalculateSkillGapBatchUseCase(world.Context, managerA, world.Scope(managerA), world.RunService())
            .ExecuteAsync(new CalculateSkillGapBatchUseCaseInput());

        // Phòng A: analyst (tính được), new joiner (chưa gán vị trí), inactive (không nằm trong tập quét)
        result.CalculatedCount.Should().Be(1);
        result.Runs.Should().ContainSingle(r => r.EmployeeId == world.Analyst.Id && r.GapCount == 3);
        result.Skipped.Should().ContainSingle(s => s.EmployeeId == world.Unassigned.Id && s.Reason == SkillGapSkipReasons.NoJobPosition);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Recalculate_AppendsSnapshot_AndListShowsLatestOnlyByDefault()
    {
        var world = await CreateWorldAsync();
        var hr = world.HrManager();
        var first = await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        var second = await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        var list = new GetSkillGapRunsUseCase(world.Context, world.Scope(hr), world.Reader());

        var latest = await list.ExecuteAsync(new GetSkillGapRunsUseCaseInput { EmployeeId = world.Analyst.Id });
        var history = await list.ExecuteAsync(new GetSkillGapRunsUseCaseInput { EmployeeId = world.Analyst.Id, LatestOnly = false });

        latest.Items.Should().ContainSingle().Which.RunId.Should().Be(second.RunId);
        latest.Items[0].CoveragePercent.Should().Be(47.50m);
        latest.Items[0].HighCount.Should().Be(2);
        history.TotalItems.Should().Be(2);
        history.Items.Select(i => i.RunId).Should().Contain(first.RunId);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetRuns_LatestOnly_ReturnsOneRowWhenTwoRunsShareGeneratedAt()
    {
        var world = await CreateWorldAsync();
        var generatedAt = DateTimeOffset.UtcNow;
        SkillGapRun NewRun() => new()
        {
            EmployeeId = world.Analyst.Id,
            RequirementSetId = world.ActiveSet.Id,
            GeneratedAt = generatedAt,
            GeneratedBy = Statuses.SkillGapGeneratedBy.System,
            GapCount = 3,
            CalculationVersion = SkillGapCalculator.CalculationVersion,
        };
        world.Context.SkillGapRuns.AddRange(NewRun(), NewRun());
        await world.Context.SaveChangesAsync();
        var hr = world.HrManager();

        var page = await new GetSkillGapRunsUseCase(world.Context, world.Scope(hr), world.Reader())
            .ExecuteAsync(new GetSkillGapRunsUseCaseInput { EmployeeId = world.Analyst.Id });

        page.TotalItems.Should().Be(1);
        page.Items.Should().ContainSingle();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetRuns_ForDepartmentManager_OnlyListsOwnDepartment()
    {
        var world = await CreateWorldAsync();
        var hr = world.HrManager();
        await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });
        await Calculate(world, hr).ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });
        var managerB = world.ManagerOf(world.DepartmentB);

        var page = await new GetSkillGapRunsUseCase(world.Context, world.Scope(managerB), world.Reader())
            .ExecuteAsync(new GetSkillGapRunsUseCaseInput());

        page.Items.Should().ContainSingle().Which.EmployeeId.Should().Be(world.AnalystInDepartmentB.Id);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Calculate_UsesOrganizationSettingOverride()
    {
        var world = await CreateWorldAsync();
        world.Context.SystemSettings.Add(new SystemSetting
        {
            OrganizationId = world.Organization.Id,
            Key = SkillGapSettingsProvider.SettingKey,
            Value = """{"mandatoryMultiplier":2,"mediumWeightThreshold":20}""",
        });
        await world.Context.SaveChangesAsync();

        var detail = await Calculate(world, world.HrManager())
            .ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = world.Analyst.Id });

        detail.Items.First().PriorityScore.Should().Be(120m); // DATA_LITERACY: 2 × 30 × 2
        detail.Summary.Config.MandatoryMultiplier.Should().Be(2m);
    }
}
