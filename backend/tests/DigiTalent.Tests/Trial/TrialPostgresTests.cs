using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Trial;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Trial;
using DigiTalent.Tests.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

[Collection("PostgresIntegration")]
[Trait("Category", "PostgresIntegration")]
[Trait("Category", "Integration")]
public sealed class TrialPostgresTests
{
    [Fact]
    public async Task Parallel_last_seat_has_one_success_and_no_orphan_reservation()
    {
        await using var setup = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(setup);
        var organization = new DigiTalent.Domain.Entities.Organization { Code = "TRIAL-TEST-" + Guid.NewGuid().ToString("N"), Name = "Concurrency test" };
        var owner = new User { OrganizationId = organization.Id, Email = Guid.NewGuid().ToString("N") + "@example.test", DisplayName = "Owner", PasswordHash = "test-only" };
        var department = new Department { OrganizationId = organization.Id, Code = "TRIAL", Name = "Team" };
        var position = new JobPosition { OrganizationId = organization.Id, Code = "TRIAL", Name = "Digital skills" };
        var policy = new TrialOptions { MaxAccounts = 2, DevelopmentEnvironment = true, EnableDevelopmentCapture = true, EnableDevelopmentBundle = true };
        var trial = new TrialWorkspace { OrganizationId = organization.Id, OwnerUserId = owner.Id, DepartmentId = department.Id, PositionId = position.Id,
            StartedAt = DateTimeOffset.UtcNow, EndsAt = DateTimeOffset.UtcNow.AddDays(14), PolicyJson = JsonSerializer.Serialize(policy), BundleJson = JsonSerializer.Serialize(DevelopmentTrialCatalog.CreateBundle()) };
        setup.AddRange(organization, owner, department, position, trial); await setup.SaveChangesAsync();
        var actor = new Mock<ICurrentUser>();
        actor.SetupGet(x => x.IsAuthenticated).Returns(true); actor.SetupGet(x => x.UserId).Returns(owner.Id); actor.SetupGet(x => x.OrganizationId).Returns(organization.Id);
        var password = new Mock<IPasswordHasher>();
        await using var first = PostgresTestDatabase.CreateContext();
        await using var second = PostgresTestDatabase.CreateContext();
        // Both calls begin from the same workspace revision, as concurrent HTTP requests may do.
        await first.TrialWorkspaces.SingleAsync(x => x.Id == trial.Id);
        await second.TrialWorkspaces.SingleAsync(x => x.Id == trial.Id);
        var firstService = new TrialService(first, actor.Object, password.Object, policy, new DevelopmentCaptureTrialEmailSender(), new DevelopmentTrialCatalog(policy), TimeProvider.System);
        var secondService = new TrialService(second, actor.Object, password.Object, policy, new DevelopmentCaptureTrialEmailSender(), new DevelopmentTrialCatalog(policy), TimeProvider.System);
        var outcomes = await Task.WhenAll(Attempt(() => firstService.InviteAsync(new("One", Guid.NewGuid().ToString("N") + "@example.test", "Employee"))),
            Attempt(() => secondService.InviteAsync(new("Two", Guid.NewGuid().ToString("N") + "@example.test", "Employee"))));
        Assert.Single(outcomes.Where(x => x == null));
        Assert.Single(outcomes.Where(x => x is DbUpdateConcurrencyException or DigiTalent.Application.Common.Exceptions.ConflictException));
        setup.ChangeTracker.Clear();
        Assert.Equal(1, await setup.TrialInvitations.CountAsync(x => x.OrganizationId == organization.Id));
        Assert.Equal(1, (await setup.TrialWorkspaces.SingleAsync(x => x.Id == trial.Id)).Revision);
    }

    private static async Task<Exception?> Attempt(Func<Task<TrialInvitationDto>> action)
    {
        try { await action(); return null; }
        catch (Exception exception) { return exception; }
    }
}
