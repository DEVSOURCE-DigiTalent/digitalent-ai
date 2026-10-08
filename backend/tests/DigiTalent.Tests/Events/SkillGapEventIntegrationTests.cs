using DigiTalent.Application;
using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Application.UseCases.Organization.Employees;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using DigiTalent.Infrastructure;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Tests.Competency;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Events;

/// <summary>
/// Domain event tự tính lại skill gap trên PostgreSQL thật, với DI giống Program.cs (AddApplication + AddInfrastructure,
/// có validation decorator). Spec Sprint 3 §6, AC-EVT-01..05.
/// </summary>
[Collection("PostgresIntegration")]
public class SkillGapEventIntegrationTests
{
    private sealed class FailingRecalculation : IDomainEventHandler<EmployeeCompetencyLevelConfirmed>
    {
        public Task HandleAsync(IReadOnlyList<EmployeeCompetencyLevelConfirmed> events, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("recalculation failed");
    }

    private sealed class Harness
    {
        public required SkillGapTestWorld World { get; init; }
        public required ServiceProvider Services { get; init; }
        public required Mock<INotificationSender> Notifications { get; init; }
        public required User AnalystUser { get; init; }

        public TUseCase UseCase<TUseCase>(IServiceScope scope) where TUseCase : notnull =>
            scope.ServiceProvider.GetRequiredService<TUseCase>();

        public AppDbContext FreshContext() => PostgresTestDatabase.CreateContext();
    }

    private static async Task<Harness> CreateAsync(Action<IServiceCollection>? configure = null)
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        var world = await SkillGapTestWorld.CreateAsync(context);

        // Analyst cần tài khoản để nhận thông báo
        var analystUser = new User
        {
            OrganizationId = world.Organization.Id,
            Email = $"analyst_{Guid.NewGuid():N}@test.local",
            PasswordHash = "x",
            DisplayName = "Analyst",
        };
        context.Users.Add(analystUser);
        world.Analyst.UserId = analystUser.Id;
        await context.SaveChangesAsync();

        var hrUserId = await context.Users
            .Where(u => u.OrganizationId == world.Organization.Id && u.Id != analystUser.Id)
            .Select(u => u.Id)
            .FirstAsync();
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(world.Organization.Id);
        currentUser.Setup(c => c.OrganizationId).Returns(world.Organization.Id);
        currentUser.Setup(c => c.UserId).Returns(hrUserId);
        currentUser.Setup(c => c.IsAuthenticated).Returns(true);
        currentUser.Setup(c => c.IsAdmin).Returns(true); // OWNER

        var notifications = new Mock<INotificationSender>();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["ConnectionStrings:DefaultConnection"] = PostgresTestDatabase.ConnectionString() })
            .Build();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplication();
        services.AddInfrastructure(configuration);
        services.AddSingleton(currentUser.Object);
        services.AddSingleton(notifications.Object);
        configure?.Invoke(services);

        return new Harness
        {
            World = world,
            Services = services.BuildServiceProvider(),
            Notifications = notifications,
            AnalystUser = analystUser,
        };
    }

    private static async Task<CreateManualEvidenceUseCaseOutput> ConfirmAsync(Harness harness, string competencyCode, short level)
    {
        // await bên trong scope: scope (và DbContext) chỉ dispose sau khi use case chạy xong
        using var scope = harness.Services.CreateScope();
        return await harness.UseCase<IUseCase<CreateManualEvidenceUseCaseInput, CreateManualEvidenceUseCaseOutput>>(scope)
            .ExecuteAsync(new CreateManualEvidenceUseCaseInput
            {
                EmployeeId = harness.World.Analyst.Id,
                CompetencyId = harness.World.Competencies[competencyCode].Id,
                ConfirmedLevel = level,
                ReviewNote = "Security incident drill led successfully",
            });
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ManualEvidence_ConfirmsLevel_RecalculatesSkillGap_AndNotifiesAfterCommit()
    {
        var harness = await CreateAsync();

        var result = await ConfirmAsync(harness, "INFORMATION_SECURITY", 2);

        await using var db = harness.FreshContext();
        var evidence = await db.CompetencyEvidences.SingleAsync(e => e.Id == result.EvidenceId);
        evidence.Should().BeEquivalentTo(new
        {
            SourceType = Statuses.EvidenceSourceType.ManualOverride,
            Status = Statuses.EvidenceStatus.Confirmed,
            IsLevelConfirming = true,
            ConfirmedLevel = (short?)2,
        });
        var profile = await db.EmployeeCompetencyProfiles.SingleAsync(p =>
            p.EmployeeId == harness.World.Analyst.Id && p.CompetencyId == harness.World.Competencies["INFORMATION_SECURITY"].Id);
        profile.ConfirmedLevel.Should().Be(2);
        profile.LatestConfirmingEvidenceId.Should().Be(evidence.Id);
        result.PreviousLevel.Should().BeNull();

        var run = await db.SkillGapRuns.SingleAsync(r => r.EmployeeId == harness.World.Analyst.Id);
        run.GeneratedBy.Should().Be(Statuses.SkillGapGeneratedBy.System);
        run.GapCount.Should().Be(2, "information security is now met; data literacy and AI literacy remain");

        var notification = await db.Notifications.SingleAsync(n => n.RecipientUserId == harness.AnalystUser.Id);
        notification.Type.Should().Be(SkillGapRecalculationHandler.NotificationType);
        notification.RelatedEntityId.Should().Be(run.Id);
        (await db.AuditLogs.AnyAsync(a => a.Action == "COMPETENCY_LEVEL_OVERRIDE" && a.EntityId == profile.Id)).Should().BeTrue();

        harness.Notifications.Verify(n => n.SendNotificationToUserAsync(
            harness.AnalystUser.Id, "Skill gap updated", It.IsAny<string>(), SkillGapRecalculationHandler.NotificationType,
            It.IsAny<object?>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ManualEvidence_Reconfirm_SupersedesPreviousEvidence()
    {
        var harness = await CreateAsync();

        var first = await ConfirmAsync(harness, "DATA_LITERACY", 2);
        var second = await ConfirmAsync(harness, "DATA_LITERACY", 3);

        await using var db = harness.FreshContext();
        var previous = await db.CompetencyEvidences.SingleAsync(e => e.Id == first.EvidenceId);
        previous.Status.Should().Be(Statuses.EvidenceStatus.Superseded);
        previous.IsLevelConfirming.Should().BeFalse();
        second.SupersededEvidenceId.Should().Be(first.EvidenceId);
        second.PreviousLevel.Should().Be(2);

        var profile = await db.EmployeeCompetencyProfiles.SingleAsync(p =>
            p.EmployeeId == harness.World.Analyst.Id && p.CompetencyId == harness.World.Competencies["DATA_LITERACY"].Id);
        profile.ConfirmedLevel.Should().Be(3);
        profile.RowVersion.Should().Be(3, "seeded at 1, then updated twice");
        (await db.SkillGapRuns.CountAsync(r => r.EmployeeId == harness.World.Analyst.Id)).Should().Be(2);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ManualEvidence_WhenRecalculationFails_PersistsNothingAndSendsNothing()
    {
        var harness = await CreateAsync(s => s.AddScoped<IDomainEventHandler<EmployeeCompetencyLevelConfirmed>, FailingRecalculation>());

        var act = () => ConfirmAsync(harness, "INFORMATION_SECURITY", 2);

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("recalculation failed");
        await using var db = harness.FreshContext();
        (await db.CompetencyEvidences.AnyAsync(e => e.EmployeeId == harness.World.Analyst.Id)).Should().BeFalse();
        (await db.EmployeeCompetencyProfiles.AnyAsync(p =>
            p.EmployeeId == harness.World.Analyst.Id && p.CompetencyId == harness.World.Competencies["INFORMATION_SECURITY"].Id))
            .Should().BeFalse();
        (await db.SkillGapRuns.AnyAsync(r => r.EmployeeId == harness.World.Analyst.Id)).Should().BeFalse();
        harness.Notifications.VerifyNoOtherCalls();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ManualEvidence_ForInactiveEmployee_Returns400()
    {
        var harness = await CreateAsync();
        using var scope = harness.Services.CreateScope();

        var act = () => harness.UseCase<IUseCase<CreateManualEvidenceUseCaseInput, CreateManualEvidenceUseCaseOutput>>(scope)
            .ExecuteAsync(new CreateManualEvidenceUseCaseInput
            {
                EmployeeId = harness.World.Inactive.Id,
                CompetencyId = harness.World.Competencies["DATA_LITERACY"].Id,
                ConfirmedLevel = 2,
                ReviewNote = "n/a",
            });

        (await act.Should().ThrowAsync<BadRequestException>()).Which.Errors.Should().ContainSingle(e => e.Code == "EMPLOYEE_NOT_ACTIVE");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ActivatingNewStandard_RecalculatesActiveEmployeesAtThatPosition()
    {
        var harness = await CreateAsync();
        var world = harness.World;
        var frameworkCompetencies = await Tt02TestData.SeedMappedCompetenciesAsync(world.Context, world.Organization.Id);
        var v2 = new PositionRequirementSet
        {
            JobPositionId = world.DataAnalyst.Id,
            VersionNo = 2,
            Status = Statuses.PositionRequirementSet.Draft,
            CreatedByUserId = harness.AnalystUser.Id,
        };
        v2.Items.AddRange(Tt02TestData.Items(v2.Id, frameworkCompetencies, level: 1));
        world.Context.PositionRequirementSets.Add(v2);
        await world.Context.SaveChangesAsync();

        using (var scope = harness.Services.CreateScope())
        {
            await harness.UseCase<IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput>>(scope)
                .ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = v2.Id });
        }

        await using var db = harness.FreshContext();
        var runs = await db.SkillGapRuns.Where(r => r.RequirementSetId == v2.Id).ToListAsync();
        runs.Select(r => r.EmployeeId).Should().BeEquivalentTo(new[] { world.Analyst.Id, world.AnalystInDepartmentB.Id },
            "the inactive analyst is not recalculated");
        runs.Should().OnlyContain(r => r.GeneratedBy == Statuses.SkillGapGeneratedBy.System);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ActivatingSuccessiveVersions_NeverViolatesOneActiveSetPerPosition()
    {
        // Hồi quy: trước đây archive bộ cũ và kích hoạt bộ mới trong 1 lần lưu → thứ tự UPDATE ngẫu nhiên
        // làm vi phạm ux_requirement_sets_one_active khoảng 50% số lần.
        var harness = await CreateAsync();
        var world = harness.World;
        var frameworkCompetencies = await Tt02TestData.SeedMappedCompetenciesAsync(world.Context, world.Organization.Id);
        for (var version = 2; version <= 6; version++)
        {
            var next = new PositionRequirementSet
            {
                JobPositionId = world.DataAnalyst.Id,
                VersionNo = version,
                Status = Statuses.PositionRequirementSet.Draft,
                CreatedByUserId = harness.AnalystUser.Id,
            };
            next.Items.AddRange(Tt02TestData.Items(next.Id, frameworkCompetencies));
            world.Context.PositionRequirementSets.Add(next);
            await world.Context.SaveChangesAsync();

            using var scope = harness.Services.CreateScope();
            await harness.UseCase<IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput>>(scope)
                .ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = next.Id });
        }

        await using var db = harness.FreshContext();
        var sets = await db.PositionRequirementSets.Where(s => s.JobPositionId == world.DataAnalyst.Id).ToListAsync();
        sets.Should().ContainSingle(s => s.Status == Statuses.PositionRequirementSet.Active).Which.VersionNo.Should().Be(6);
        sets.Count(s => s.Status == Statuses.PositionRequirementSet.Archived).Should().Be(5);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ChangingEmployeePosition_RecalculatesSkillGap()
    {
        var harness = await CreateAsync();
        var world = harness.World;

        using (var scope = harness.Services.CreateScope())
        {
            await harness.UseCase<IUseCase<UpdateEmployeeUseCaseInput, UpdateEmployeeUseCaseOutput>>(scope)
                .ExecuteAsync(new UpdateEmployeeUseCaseInput
                {
                    Id = world.Unassigned.Id,
                    EmployeeCode = world.Unassigned.EmployeeCode,
                    FullName = world.Unassigned.FullName,
                    DepartmentId = world.DepartmentA.Id,
                    JobPositionId = world.DataAnalyst.Id,
                });
        }

        await using var db = harness.FreshContext();
        var run = await db.SkillGapRuns.SingleAsync(r => r.EmployeeId == world.Unassigned.Id);
        run.GapCount.Should().Be(5, "a new joiner has no confirmed levels yet");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ManualEvidence_CannotConfirmOwnCompetency()
    {
        var harness = await CreateAsync();
        await using (var db = harness.FreshContext())
        {
            // HR đang đăng nhập cũng chính là nhân viên được xác nhận
            var hrUserId = await db.Users
                .Where(u => u.OrganizationId == harness.World.Organization.Id && u.Id != harness.AnalystUser.Id)
                .Select(u => u.Id)
                .FirstAsync();
            var analyst = await db.Employees.SingleAsync(e => e.Id == harness.World.Analyst.Id);
            analyst.UserId = hrUserId;
            await db.SaveChangesAsync();
        }

        var act = () => ConfirmAsync(harness, "DATA_LITERACY", 3);

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ExecuteInTransaction_WhenWorkFails_RollsBackEarlierSaves()
    {
        var harness = await CreateAsync();
        var code = $"TX_{Guid.NewGuid():N}"[..12];
        using var scope = harness.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var act = () => context.ExecuteInTransactionAsync(async () =>
        {
            context.Organizations.Add(new Domain.Entities.Organization { Code = code, Name = "Rolled back", Status = Statuses.Simple.Active });
            await context.SaveChangesAsync();
            throw new InvalidOperationException("second step failed");
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        await using var db = harness.FreshContext();
        (await db.Organizations.AnyAsync(o => o.Code == code)).Should().BeFalse();
        context.ChangeTracker.Entries().Should().BeEmpty();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task DomainEventsInsideCallerOwnedTransaction_AreRejected()
    {
        var harness = await CreateAsync();
        using var scope = harness.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await using var transaction = await context.Database.BeginTransactionAsync();
        context.AddDomainEvent(new EmployeeCompetencyLevelConfirmed(harness.World.Analyst.Id, Guid.NewGuid(), 2, Guid.NewGuid()));

        var act = () => context.SaveChangesAsync();

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*caller-owned transaction*");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ConcurrentProfileUpdate_SurfacesConcurrencyExceptionForCallersToHandle()
    {
        var harness = await CreateAsync();
        var competencyId = harness.World.Competencies["DATA_LITERACY"].Id;
        using var scopeA = harness.Services.CreateScope();
        using var scopeB = harness.Services.CreateScope();
        var contextA = scopeA.ServiceProvider.GetRequiredService<AppDbContext>();
        var contextB = scopeB.ServiceProvider.GetRequiredService<AppDbContext>();
        var profileA = await contextA.EmployeeCompetencyProfiles.SingleAsync(p => p.EmployeeId == harness.World.Analyst.Id && p.CompetencyId == competencyId);
        var profileB = await contextB.EmployeeCompetencyProfiles.SingleAsync(p => p.EmployeeId == harness.World.Analyst.Id && p.CompetencyId == competencyId);

        profileA.ConfirmedLevel = 2;
        profileA.RowVersion += 1;
        await contextA.SaveChangesAsync();
        profileB.ConfirmedLevel = 3;
        profileB.RowVersion += 1;
        var act = () => contextB.SaveChangesAsync();

        // Giữ nguyên exception gốc: use case có thể bắt để thử lại (LoginUseCase); middleware đổi thành 409 nếu không ai xử lý
        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }
}
