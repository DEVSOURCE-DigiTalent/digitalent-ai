using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Nhánh biên không cần PostgreSQL: validator, cấu hình hỏng, giới hạn 500 nhân viên (S3-T020, spec §10).
/// </summary>
public class IntelligenceEdgeCaseTests
{
    private static readonly Guid OrganizationId = Guid.NewGuid();

    private static AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static ICurrentUser HrManager()
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(c => c.GetRequiredOrganizationId()).Returns(OrganizationId);
        mock.Setup(c => c.OrganizationId).Returns(OrganizationId);
        mock.Setup(c => c.IsAdmin).Returns(true);
        return mock.Object;
    }

    private static SkillGapSettingsProvider SettingsProvider(AppDbContext context) =>
        new(context, NullLogger<SkillGapSettingsProvider>.Instance);

    private static void AddActiveEmployees(AppDbContext context, int count, Guid? jobPositionId)
    {
        var departmentId = Guid.NewGuid();
        for (var i = 0; i < count; i++)
        {
            context.Employees.Add(new Employee
            {
                OrganizationId = OrganizationId,
                DepartmentId = departmentId,
                JobPositionId = jobPositionId,
                EmployeeCode = $"E{i:D4}",
                FullName = $"Employee {i}",
                Status = Statuses.Employee.Active,
            });
        }
    }

    // ── Validators (use case test gọi thẳng use case nên không đi qua decorator) ──

    [Fact]
    public void CalculateSkillGapValidator_RejectsEmptyIds()
    {
        var validator = new CalculateSkillGapUseCaseValidator();

        validator.TestValidate(new CalculateSkillGapUseCaseInput()).ShouldHaveValidationErrorFor(x => x.EmployeeId);
        validator.TestValidate(new CalculateSkillGapUseCaseInput { EmployeeId = Guid.NewGuid(), RequirementSetId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.RequirementSetId);
        validator.TestValidate(new CalculateSkillGapUseCaseInput { EmployeeId = Guid.NewGuid() }).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0, 20, false)]
    [InlineData(1, 101, false)]
    [InlineData(1, 100, true)]
    public void GetSkillGapRunsValidator_EnforcesPagination(int pageIndex, int pageSize, bool isValid)
    {
        var result = new GetSkillGapRunsUseCaseValidator().TestValidate(new GetSkillGapRunsUseCaseInput { PageIndex = pageIndex, PageSize = pageSize });

        result.IsValid.Should().Be(isValid);
    }

    [Fact]
    public void GetSkillGapRunsValidator_LimitsSearchLength()
    {
        new GetSkillGapRunsUseCaseValidator().TestValidate(new GetSkillGapRunsUseCaseInput { Search = new string('x', 201) })
            .ShouldHaveValidationErrorFor(x => x.Search);
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(21, false)]
    [InlineData(20, true)]
    public void GetCourseRecommendationsValidator_EnforcesLimit(int limit, bool isValid)
    {
        new GetCourseRecommendationsUseCaseValidator().TestValidate(new GetCourseRecommendationsUseCaseInput { Limit = limit })
            .IsValid.Should().Be(isValid);
    }

    [Fact]
    public void GetCourseRecommendationsValidator_RejectsEmptyEmployeeId()
    {
        new GetCourseRecommendationsUseCaseValidator().TestValidate(new GetCourseRecommendationsUseCaseInput { EmployeeId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.EmployeeId);
    }

    // ── SkillGapSettingsProvider (D-S3-04) ──

    [Fact]
    public async Task SettingsProvider_PrefersOrganizationOverGlobal()
    {
        using var context = CreateContext();
        context.SystemSettings.AddRange(
            new SystemSetting { Key = SkillGapSettingsProvider.SettingKey, Value = """{"mandatoryMultiplier":1.2,"mediumWeightThreshold":25}""" },
            new SystemSetting { OrganizationId = OrganizationId, Key = SkillGapSettingsProvider.SettingKey, Value = """{"mandatoryMultiplier":2,"mediumWeightThreshold":30}""" });
        await context.SaveChangesAsync();

        var settings = await SettingsProvider(context).GetAsync(OrganizationId);
        var otherOrganization = await SettingsProvider(context).GetAsync(Guid.NewGuid());

        settings.Should().Be(new SkillGapSettings(2m, 30m));
        otherOrganization.Should().Be(new SkillGapSettings(1.2m, 25m));
    }

    [Theory]
    [InlineData("not json")]
    [InlineData("""{"mandatoryMultiplier":0.5,"mediumWeightThreshold":20}""")] // hệ số < 1 làm năng lực bắt buộc kém ưu tiên
    [InlineData("""{"mandatoryMultiplier":1.5,"mediumWeightThreshold":0}""")]
    public async Task SettingsProvider_FallsBackToDefaultForInvalidValues(string value)
    {
        using var context = CreateContext();
        context.SystemSettings.Add(new SystemSetting { OrganizationId = OrganizationId, Key = SkillGapSettingsProvider.SettingKey, Value = value });
        await context.SaveChangesAsync();

        var settings = await SettingsProvider(context).GetAsync(OrganizationId);

        settings.Should().Be(SkillGapSettings.Default);
    }

    // ── Giới hạn 500 nhân viên ──

    [Fact]
    public async Task Batch_RejectsMoreThan500Employees()
    {
        using var context = CreateContext();
        AddActiveEmployees(context, CalculateSkillGapBatchUseCase.MaxEmployeesPerBatch + 1, jobPositionId: null);
        await context.SaveChangesAsync();
        var user = HrManager();
        var useCase = new CalculateSkillGapBatchUseCase(
            context, user, new Application.Common.Authorization.EmployeeScope(context, user),
            new SkillGapRunService(context, SettingsProvider(context)));

        var act = () => useCase.ExecuteAsync(new CalculateSkillGapBatchUseCaseInput());

        (await act.Should().ThrowAsync<BadRequestException>()).Which.Errors.Should().ContainSingle(e => e.Code == "BATCH_TOO_LARGE");
    }

    [Fact]
    public async Task ActivationHandler_SkipsPositionsWithMoreThan500Employees()
    {
        using var context = CreateContext();
        var positionId = Guid.NewGuid();
        AddActiveEmployees(context, SkillGapRecalculationHandler.MaxEmployeesPerActivation + 1, positionId);
        await context.SaveChangesAsync();
        var afterCommit = new Mock<IAfterCommitQueue>();
        var handler = new SkillGapRecalculationHandler(
            context, new SkillGapRunService(context, SettingsProvider(context)), afterCommit.Object,
            Mock.Of<INotificationSender>(), NullLogger<SkillGapRecalculationHandler>.Instance);

        await handler.HandleAsync(new[] { new PositionRequirementSetActivated(Guid.NewGuid(), positionId) }, CancellationToken.None);

        context.ChangeTracker.Entries<SkillGapRun>().Should().BeEmpty("HR must use calculate-batch for very large positions");
        afterCommit.VerifyNoOtherCalls();
    }
}
