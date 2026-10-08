using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Trial;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Trial;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

public sealed class TrialReadinessTests
{
    [Fact]
    public async Task Missing_sender_content_and_policy_blocks_production_registration()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var options = new TrialOptions();
        var sender = new UnavailableTrialEmailSender();
        var catalog = new DevelopmentTrialCatalog(options);
        var service = new TrialService(db, Mock.Of<ICurrentUser>(), Mock.Of<IPasswordHasher>(), options, sender, catalog, TimeProvider.System);
        Assert.Empty(catalog.Bundles);
        Assert.False(sender.IsReady);
        var ready = service.Readiness();
        Assert.False(ready.CanRegister);
        Assert.False(ready.ProductionReady);
        Assert.False(ready.DevelopmentOnly);
        Assert.Contains("email_sender_unavailable", ready.MissingReasons);
        Assert.Contains("approved_bundle_unavailable", ready.MissingReasons);
        Assert.Contains("data_policy_not_approved", ready.MissingReasons);
        await Assert.ThrowsAsync<ForbiddenException>(() => service.RegisterAsync(new("Company", "Owner", "owner@example.test", "Strong-pass-123!", "technology", "1-20", "onboarding", true)));
        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync("owner@example.test", "verify", "private-token"));
        await Assert.ThrowsAsync<ForbiddenException>(() => service.ContextAsync());
    }

    [Fact]
    public async Task Explicit_development_configuration_has_one_eligible_bundle_and_never_production_readiness()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var options = new TrialOptions { DevelopmentEnvironment = true, EnableDevelopmentBundle = true, EnableDevelopmentCapture = true };
        var sender = new DevelopmentCaptureTrialEmailSender();
        var service = new TrialService(db, Mock.Of<ICurrentUser>(), Mock.Of<IPasswordHasher>(), options, sender, new DevelopmentTrialCatalog(options), TimeProvider.System);
        Assert.True(sender.IsReady);
        await sender.SendAsync("owner@example.test", "verify", "private-token");
        Assert.Single(service.Catalog().Where(x => x.Eligible));
        Assert.Equal(4, service.Catalog().Count(x => !x.Eligible));
        Assert.All(service.Catalog().Where(x => !x.Eligible), x => Assert.NotEmpty(x.MissingReasons));
        Assert.True(service.Readiness().CanRegister);
        Assert.False(service.Readiness().ProductionReady);
    }

    [Fact]
    public void Invalid_trial_policy_and_attempt_count_are_rejected()
    {
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { DurationDays = 0 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { MaxDiagnosticAttempts = 2 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { VerificationHours = 0 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { InvitationHours = 0 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { MaxInvitationSends = 0 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { ResendCooldownSeconds = 0 }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { PolicyVersion = "" }).Validate());
        Assert.Throws<InvalidOperationException>(() => (new TrialOptions { PublicAppUrl = "file:///secret" }).Validate());
    }
}
