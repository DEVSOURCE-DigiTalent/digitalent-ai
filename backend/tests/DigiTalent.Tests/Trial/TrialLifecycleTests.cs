using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Trial;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Trial;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

public sealed class TrialLifecycleTests
{
    [Fact]
    public void Policy_validates_defaults_and_rejects_expiry_and_absence()
    {
        var options = new TrialOptions();
        options.Validate();
        Assert.Equal(14, options.DurationDays);
        Assert.Equal(5, options.MaxAccounts);
        Assert.Equal(1, options.MaxDiagnosticAttempts);
        Assert.Throws<InvalidOperationException>(() => (options with { MaxAccounts = 0 }).Validate());
        Assert.Throws<ForbiddenException>(() => TrialPolicy.EnsureWritable(null, DateTimeOffset.UtcNow));
        var trial = new TrialWorkspace { EndsAt = DateTimeOffset.UtcNow.AddDays(-1) };
        Assert.Throws<ForbiddenException>(() => TrialPolicy.EnsureWritable(trial, DateTimeOffset.UtcNow));
    }

    [Fact]
    public async Task Verification_is_hashed_expiring_single_use_and_creates_tenant_only_after_verify()
    {
        using var world = new World();
        await world.Service.RegisterAsync(world.Registration(" OWNER@Example.test "));
        Assert.Empty(await world.Db.Organizations.ToListAsync());
        var token = world.Mail.LatestToken;
        Assert.NotEqual(token, (await world.Db.TrialRegistrations.SingleAsync()).TokenHash);
        var owner = await world.Service.VerifyAsync(token);
        Assert.Single(await world.Db.Organizations.ToListAsync());
        Assert.Equal("owner@example.test", (await world.Db.Users.SingleAsync()).Email);
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.VerifyAsync(token));
        Assert.Equal(owner.OrganizationId, (await world.Db.TrialWorkspaces.SingleAsync()).OrganizationId);
        using var expired = new World();
        await expired.Service.RegisterAsync(expired.Registration("expired@example.test"));
        expired.Clock.Now = expired.Clock.Now.AddDays(2);
        await Assert.ThrowsAsync<BadRequestException>(() => expired.Service.VerifyAsync(expired.Mail.LatestToken));
        Assert.Empty(await expired.Db.Organizations.ToListAsync());
    }

    [Fact]
    public async Task Seat_reservations_normalized_email_resend_and_single_use_invitation()
    {
        using var world = new World(new TrialOptions { MaxAccounts = 2 });
        await world.CreateOwnerAndPosition();
        var invite = await world.Service.InviteAsync(new("Person", " Person@Example.test ", "Employee"));
        var original = world.Mail.LatestToken;
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.InviteAsync(new("Duplicate", "person@example.test", "Employee")));
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.InviteAsync(new("Second", "second@example.test", "Employee")));
        world.Clock.Now = world.Clock.Now.AddMinutes(2);
        await world.Service.ResendAsync(invite.Id);
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.AcceptAsync(new(original, "Strong-pass-123!")));
        var accepted = await world.Service.AcceptAsync(new(world.Mail.LatestToken, "Strong-pass-123!"));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.AcceptAsync(new(world.Mail.LatestToken, "Strong-pass-123!")));
        Assert.Equal(world.OwnerOrganizationId, accepted.OrganizationId);
        Assert.Equal(2, (await world.Service.ContextAsync()).Usage.Accounts);
    }

    [Fact]
    public async Task Invitation_rejects_owner_role_expired_token_employee_and_foreign_tenant()
    {
        using var world = new World();
        await world.CreateOwnerAndPosition();
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.InviteAsync(new("Bad", "bad@example.test", "Owner")));
        await world.Service.InviteAsync(new("Expired", "expired@example.test", "Employee"));
        world.Clock.Now = world.Clock.Now.AddDays(4);
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.AcceptAsync(new(world.Mail.LatestToken, "Strong-pass-123!")));
        world.Actor(Guid.NewGuid(), Guid.NewGuid(), "Employee");
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.InviteAsync(new("Bad", "bad2@example.test", "Employee")));
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ContextAsync());
    }

    [Fact]
    public async Task Diagnostic_resume_submit_freeze_path_progress_and_conversion_preserve_same_data()
    {
        using var world = new World();
        await world.CreateEmployee();
        var started = await world.Service.StartAsync();
        var question = started.Questions.First();
        var saved = await world.Service.SaveAnswersAsync(started.AttemptId, new(0, started.Questions.Select(q => new TrialAnswerDto(q.Id, q.Options.Last().Id)).ToArray()));
        Assert.Equal(1, saved.Revision);
        world.Db.ChangeTracker.Clear();
        Assert.Equal(started.Questions.Length, (await world.Service.DiagnosticAsync())!.SavedAnswers.Length);
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.SaveAnswersAsync(started.AttemptId, new(0, [])));
        world.Catalog.Bundle = world.Catalog.Bundle with { RequirementVersion = "changed-v2" };
        var result = await world.Service.SubmitAsync(started.AttemptId);
        Assert.Equal("development-standard-v1", result.RequirementVersion);
        Assert.Equal(JsonSerializer.Serialize(result), JsonSerializer.Serialize(await world.Service.SubmitAsync(started.AttemptId)));
        Assert.Contains(result.Items, i => i.Classification == "gap");
        Assert.Contains(result.Items, i => i.Classification == "insufficient_data" && i.CurrentLevel is null && i.GapSteps is null);
        foreach (var secretField in new[] { "correctoption", "tokenhash", "passwordhash" })
            Assert.DoesNotContain(secretField, JsonSerializer.Serialize(saved).ToLowerInvariant());
        var path = await world.Service.PathAsync();
        Assert.Equal("ready", path!.State);
        Assert.Contains("digital-safety", path.Items[0].Reasons[0]);
        var item = path.Items[0];
        await world.Service.StartItemAsync(item.Id);
        await world.Service.ProgressAsync(item.Id, new(35));
        world.Db.ChangeTracker.Clear();
        Assert.Equal(35, (await world.Service.PathAsync())!.Items[0].ProgressPercent);
        Assert.NotEmpty((await world.Service.ContentAsync(item.Id)).Body);
        var attemptId = started.AttemptId;
        world.Actor(world.OwnerId, world.OwnerOrganizationId, "Owner");
        var rows = await world.Service.ResultsAsync();
        Assert.Contains(rows, r => r.State == "learning_in_progress");
        Assert.True((await world.Service.ContextAsync()).Checklist.Single(x => x.Key == "results").Complete);
        var platformAdmin = new User { Email = "platform-admin@example.test", DisplayName = "Platform admin", PasswordHash = "test-only" };
        var platformAdminRole = new Role { Code = "SYSTEM_ADMIN", Name = "System admin", Status = "ACTIVE" };
        world.Db.AddRange(platformAdmin, platformAdminRole, new UserRole { UserId = platformAdmin.Id, RoleId = platformAdminRole.Id, AssignedAt = world.Clock.Now });
        await world.Db.SaveChangesAsync();
        world.Actor(platformAdmin.Id, null, "SYSTEM_ADMIN");
        await world.Service.ConvertAsync(world.OwnerOrganizationId, "approved-contract-123");
        world.Actor(world.EmployeeUserId, world.OwnerOrganizationId, "Employee");
        Assert.Equal(attemptId, (await world.Service.DiagnosticAsync())!.AttemptId);
        Assert.Equal(35, (await world.Service.PathAsync())!.Items[0].ProgressPercent);
        Assert.Equal("converted", (await world.Service.ContextAsync()).Status);
    }

    [Fact]
    public async Task Partial_answers_unknown_are_not_gaps_and_no_content_is_explicit()
    {
        using var world = new World();
        await world.CreateEmployee();
        var session = await world.Service.StartAsync();
        var result = await world.Service.SubmitAsync(session.AttemptId);
        Assert.All(result.Items, i => Assert.Equal("insufficient_data", i.Classification));
        Assert.Equal("insufficient_data", (await world.Service.PathAsync())!.State);
        using var noContent = new World();
        noContent.Catalog.Bundle = noContent.Catalog.Bundle with { Content = [] };
        // Remove content after eligible selection/start: frozen assessment still yields a truthful missing-content path.
        await noContent.CreateEmployee();
        var attempt = await noContent.Service.StartAsync();
        await noContent.Service.SaveAnswersAsync(attempt.AttemptId, new(0, attempt.Questions.Select(q => new TrialAnswerDto(q.Id, q.Options.Last().Id)).ToArray()));
        await noContent.Service.SubmitAsync(attempt.AttemptId);
        Assert.Equal("no_matching_content", (await noContent.Service.PathAsync())!.State);
    }

    [Fact]
    public async Task Correct_answers_no_measured_gap_and_prerequisites_do_not_invent_deficits()
    {
        using var world = new World();
        await world.CreateEmployee();
        var attempt = await world.Service.StartAsync();
        await world.Service.SaveAnswersAsync(attempt.AttemptId, new(0, attempt.Questions.Select(q => new TrialAnswerDto(q.Id, q.Options.First().Id)).ToArray()));
        var result = await world.Service.SubmitAsync(attempt.AttemptId);
        Assert.DoesNotContain(result.Items, i => i.Classification == "gap");
        Assert.Equal("no_measured_gap", (await world.Service.PathAsync())!.State);
    }

    [Fact]
    public async Task Expiry_denies_all_mutations_but_scoped_reads_remain()
    {
        using var world = new World();
        await world.CreateEmployee();
        var attempt = await world.Service.StartAsync();
        world.Clock.Now = world.Clock.Now.AddDays(14);
        Assert.Equal("trial_read_only", (await world.Service.ContextAsync()).Status);
        Assert.NotNull(await world.Service.DiagnosticAsync());
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.StartAsync());
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.SaveAnswersAsync(attempt.AttemptId, new(0, [])));
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.SubmitAsync(attempt.AttemptId));
    }

    [Fact]
    public async Task Employee_cannot_read_report_and_manager_scope_is_database_bound()
    {
        using var world = new World();
        await world.CreateEmployee();
        var attempt = await world.Service.StartAsync();
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ResultsAsync());
        world.Actor(world.EmployeeUserId, world.OwnerOrganizationId, "Manager", Guid.NewGuid());
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ResultsAsync());
        world.Actor(Guid.NewGuid(), Guid.NewGuid(), "Owner");
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.SaveAnswersAsync(attempt.AttemptId, new(0, [])));
    }

    [Fact]
    public async Task Catalog_readiness_selection_and_invalid_inputs_fail_closed()
    {
        using var world = new World();
        Assert.True(world.Service.Readiness().CanRegister);
        var catalog = world.Service.Catalog();
        Assert.True(catalog.Single().DevelopmentOnly);
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.RegisterAsync(world.Registration("not-an-email")));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.RegisterAsync(world.Registration("ok@example.test") with { Password = "weak" }));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.RegisterAsync(world.Registration("ok@example.test") with { AcceptedTerms = false }));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.VerifyAsync("invalid"));
        await world.CreateOwnerAndPosition();
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.SelectPositionAsync(new("digital-skills", "Other")));
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ResultAsync());
        world.Catalog.Bundle = world.Catalog.Bundle with { Approved = false, Active = false, Questions = [], Content = [] };
        Assert.False(world.Service.Catalog().Single().Eligible);
        Assert.False(world.Service.Readiness().CanRegister);
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.RegisterAsync(world.Registration("not-ready@example.test")));
    }

    [Fact]
    public async Task Invitation_lists_pending_and_resend_cooldown_and_limit_are_honest()
    {
        using var world = new World(new TrialOptions { MaxInvitationSends = 2 });
        await world.CreateOwnerAndPosition();
        var invite = await world.Service.InviteAsync(new("Person", "person@example.test", "Employee"));
        Assert.Equal("pending", (await world.Service.InvitationsAsync()).Single().State);
        Assert.Equal("pending_invitation", (await world.Service.ResultsAsync()).Single().State);
        Assert.False((await world.Service.ContextAsync()).Checklist.Single(x => x.Key == "results").Complete);
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.ResendAsync(invite.Id));
        world.Clock.Now = world.Clock.Now.AddDays(4);
        Assert.Equal("expired", (await world.Service.InvitationsAsync()).Single().State);
        await world.Service.ResendAsync(invite.Id);
        world.Clock.Now = world.Clock.Now.AddMinutes(2);
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.ResendAsync(invite.Id));
        await Assert.ThrowsAsync<NotFoundException>(() => world.Service.ResendAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task Diagnostic_validation_cross_employee_content_and_progress_are_enforced()
    {
        using var world = new World();
        await world.CreateEmployee();
        Assert.Null(await world.Service.DiagnosticAsync());
        Assert.Null(await world.Service.ResultAsync());
        Assert.Null(await world.Service.PathAsync());
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.StartItemAsync("missing"));
        var started = await world.Service.StartAsync();
        Assert.Equal(started.AttemptId, (await world.Service.StartAsync()).AttemptId);
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.SaveAnswersAsync(started.AttemptId, new(0, [new("q1", "invalid")])));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.SaveAnswersAsync(started.AttemptId, new(0, [new("q1", "a"), new("q1", "b")])));
        await Assert.ThrowsAsync<NotFoundException>(() => world.Service.SubmitAsync(Guid.NewGuid()));
        await world.Service.SaveAnswersAsync(started.AttemptId, new(0, [new("q1", "b"), new("q2", "b")]));
        await world.Service.SubmitAsync(started.AttemptId);
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.SaveAnswersAsync(started.AttemptId, new(2, [])));
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ContentAsync("safe-accounts"));
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.ProgressAsync("safe-accounts", new(50)));
        await Assert.ThrowsAsync<BadRequestException>(() => world.Service.ProgressAsync("safe-accounts", new(101)));
        await Assert.ThrowsAsync<NotFoundException>(() => world.Service.StartItemAsync("missing"));
        await world.Service.StartItemAsync("safe-accounts");
        await world.Service.StartItemAsync("safe-accounts");
        await world.Service.ProgressAsync("safe-accounts", new(100));
        Assert.Equal(100, (await world.Service.ProgressAsync("safe-accounts", new(25))).Items[0].ProgressPercent);
        Assert.NotEmpty((await world.Service.ContentAsync("safe-accounts")).Body);
        world.Actor(world.OwnerId, world.OwnerOrganizationId, "Owner");
        var rows = await world.Service.ResultsAsync();
        Assert.NotNull(rows.Single().Result);
        var other = await world.Service.InviteAsync(new("Other employee", "other@example.test", "Employee"));
        var account = await world.Service.AcceptAsync(new(world.Mail.LatestToken, "Strong-pass-123!"));
        world.Actor(account.UserId, account.OrganizationId, "Employee");
        await Assert.ThrowsAsync<NotFoundException>(() => world.Service.SaveAnswersAsync(started.AttemptId, new(0, [])));
        await Assert.ThrowsAsync<ConflictException>(() => world.Service.ProgressAsync("safe-accounts", new(50)));
    }

    [Fact]
    public async Task Assigned_manager_has_group_report_but_no_diagnostic_and_employee_cannot_convert()
    {
        using var world = new World();
        await world.CreateEmployee();
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ConvertAsync(world.OwnerOrganizationId, "fake"));
        world.Actor(world.OwnerId, world.OwnerOrganizationId, "Owner");
        await world.Service.InviteAsync(new("Manager", "manager@example.test", "Manager"));
        var manager = await world.Service.AcceptAsync(new(world.Mail.LatestToken, "Strong-pass-123!"));
        world.Actor(manager.UserId, manager.OrganizationId, "Manager");
        Assert.DoesNotContain("diagnostic", (await world.Service.ContextAsync()).AllowedActions);
        Assert.Contains("view_results", (await world.Service.ContextAsync()).AllowedActions);
        Assert.Equal(2, (await world.Service.ResultsAsync()).Length);
        Assert.Equal(2, (await world.Service.InvitationsAsync()).Length);
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.StartAsync());
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.InviteAsync(new("Another manager", "another@example.test", "Manager")));
        world.Actor(world.OwnerId, world.OwnerOrganizationId, "Owner");
        world.Clock.Now = world.Clock.Now.AddDays(14);
        Assert.Equal("trial_read_only", (await world.Service.RequestConversionAsync()).Status);
        Assert.Equal("trial_read_only", (await world.Service.RequestConversionAsync()).Status);
        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.InviteAsync(new("Too late", "late@example.test", "Employee")));
    }

    [Fact]
    public async Task Failed_verification_delivery_releases_registration_for_retry()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var options = new TrialOptions { DevelopmentEnvironment = true, EnableDevelopmentCapture = true, EnableDevelopmentBundle = true };
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("bcrypt-test-only");
        var service = new TrialService(db, Mock.Of<ICurrentUser>(), hasher.Object, options, new ThrowingEmail(), new DevelopmentTrialCatalog(options), TimeProvider.System);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(new("Company", "Owner", "retry@example.test", "Strong-pass-123!", "technology", "1-20", "onboarding", true)));

        Assert.False(await db.TrialRegistrations.AnyAsync(x => x.Email == "retry@example.test"));
    }

    [Fact]
    public async Task Stale_system_admin_claim_cannot_convert_after_role_is_removed()
    {
        using var world = new World();
        await world.CreateOwnerAndPosition();
        var platformAdmin = new User { Email = "removed-admin@example.test", DisplayName = "Removed admin", PasswordHash = "test-only" };
        world.Db.Users.Add(platformAdmin);
        await world.Db.SaveChangesAsync();
        world.Actor(platformAdmin.Id, null, "SYSTEM_ADMIN");

        await Assert.ThrowsAsync<ForbiddenException>(() => world.Service.ConvertAsync(world.OwnerOrganizationId, "stale-token"));
    }

    private sealed class World : IDisposable
    {
        public readonly AppDbContext Db = new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        public readonly CapturingEmail Mail = new();
        public readonly FakeClock Clock = new();
        public readonly MutableCatalog Catalog = new();
        public readonly Mock<ICurrentUser> Current = new();
        public readonly TrialService Service;
        public Guid OwnerId, OwnerOrganizationId, EmployeeUserId;
        public World(TrialOptions? options = null)
        {
            var hasher = new Mock<IPasswordHasher>();
            hasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("bcrypt-test-only");
            var policy = (options ?? new()) with { DevelopmentEnvironment = true, EnableDevelopmentCapture = true, EnableDevelopmentBundle = true };
            Service = new(Db, Current.Object, hasher.Object, policy, Mail, Catalog, Clock);
        }
        public TrialRegistrationRequest Registration(string email) => new("Company", "Owner", email, "Strong-pass-123!", "technology", "1-20", "onboarding", true);
        public async Task CreateOwnerAndPosition()
        {
            await Service.RegisterAsync(Registration("owner@example.test"));
            var verified = await Service.VerifyAsync(Mail.LatestToken);
            OwnerId = verified.UserId; OwnerOrganizationId = verified.OrganizationId;
            Actor(OwnerId, OwnerOrganizationId, "Owner");
            await Service.SelectPositionAsync(new("digital-skills", "Trial team"));
        }
        public async Task CreateEmployee()
        {
            var content = Catalog.Bundle.Content;
            if (content.Length == 0) Catalog.Bundle = DevelopmentTrialCatalog.CreateBundle();
            await CreateOwnerAndPosition();
            Catalog.Bundle = Catalog.Bundle with { Content = content };
            if (content.Length == 0)
            {
                var trial = await Db.TrialWorkspaces.SingleAsync();
                trial.BundleJson = JsonSerializer.Serialize(Catalog.Bundle);
                await Db.SaveChangesAsync();
            }
            await Service.InviteAsync(new("Employee", "employee@example.test", "Employee"));
            var accepted = await Service.AcceptAsync(new(Mail.LatestToken, "Strong-pass-123!"));
            EmployeeUserId = accepted.UserId;
            Actor(EmployeeUserId, OwnerOrganizationId, "Employee");
        }
        public void Actor(Guid id, Guid? org, string role, Guid? dept = null)
        {
            Current.SetupGet(x => x.IsAuthenticated).Returns(true);
            Current.SetupGet(x => x.UserId).Returns(id);
            Current.SetupGet(x => x.OrganizationId).Returns(org);
            Current.SetupGet(x => x.DepartmentId).Returns(dept);
            Current.SetupGet(x => x.Roles).Returns([role]);
            Current.Setup(x => x.IsInRole(It.IsAny<string>())).Returns<string>(r => r == role);
        }
        public void Dispose() => Db.Dispose();
    }
    private sealed class FakeClock : TimeProvider
    {
        public DateTimeOffset Now = new(2026, 10, 6, 0, 0, 0, TimeSpan.Zero);
        public override DateTimeOffset GetUtcNow() => Now;
    }
    private sealed class CapturingEmail : ITrialEmailSender
    {
        public bool IsReady => true;
        public string LatestToken = "";
        public Task SendAsync(string email, string kind, string token, CancellationToken ct = default) { LatestToken = token; return Task.CompletedTask; }
    }
    private sealed class ThrowingEmail : ITrialEmailSender
    {
        public bool IsReady => true;
        public Task SendAsync(string email, string kind, string token, CancellationToken ct = default) => throw new InvalidOperationException("delivery failed");
    }
    private sealed class MutableCatalog : ITrialCatalog
    {
        public TrialBundle Bundle = DevelopmentTrialCatalog.CreateBundle();
        public bool IsProductionApproved => false;
        public IReadOnlyList<TrialBundle> Bundles => [Bundle];
    }
}
