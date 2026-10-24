using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public sealed class PasswordResetEmailTests
{
    [Fact]
    public async Task Failed_delivery_preserves_previous_reset_link()
    {
        using var db = CreateDatabase();
        var user = new User { Email = "owner@example.test", DisplayName = "Owner", PasswordHash = "old" };
        db.Users.Add(user);
        var previous = new PasswordResetToken { UserId = user.Id, TokenHash = "legacy-token", ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(20) };
        db.PasswordResetTokens.Add(previous);
        await db.SaveChangesAsync();
        previous.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2);
        await db.SaveChangesAsync();
        var sender = new Mock<IIndividualEmailSender>();
        sender.Setup(x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("SMTP unavailable"));

        var result = await new ForgotPasswordUseCase(db, sender.Object, Configuration()).ExecuteAsync(new() { Email = user.Email });

        Assert.Null(result.DebugLink);
        Assert.Single(await db.PasswordResetTokens.ToListAsync());
        Assert.Null(previous.UsedAt);
        Assert.True(await new ValidateResetTokenUseCase(db).ExecuteAsync(new() { Token = "legacy-token" }));
    }

    [Fact]
    public async Task Successful_delivery_stores_only_hash_and_invalidates_previous_link()
    {
        using var db = CreateDatabase();
        var user = new User { Email = "owner@example.test", DisplayName = "Owner", PasswordHash = "old" };
        db.Users.Add(user);
        var previous = new PasswordResetToken { UserId = user.Id, TokenHash = "legacy-token", ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(20) };
        db.PasswordResetTokens.Add(previous);
        await db.SaveChangesAsync();
        previous.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2);
        await db.SaveChangesAsync();
        string? deliveredLink = null;
        var sender = new Mock<IIndividualEmailSender>();
        sender.Setup(x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((_, _, link, _) => deliveredLink = link)
            .Returns(Task.CompletedTask);

        await new ForgotPasswordUseCase(db, sender.Object, Configuration()).ExecuteAsync(new() { Email = user.Email });

        var rawToken = deliveredLink!.Split('/').Last();
        var current = await db.PasswordResetTokens.SingleAsync(x => x.Id != previous.Id);
        Assert.NotEqual(rawToken, current.TokenHash);
        Assert.Equal(64, current.TokenHash.Length);
        Assert.NotNull(previous.UsedAt);
        Assert.True(await new ValidateResetTokenUseCase(db).ExecuteAsync(new() { Token = rawToken }));
        var passwords = new Mock<IPasswordHasher>();
        passwords.Setup(x => x.Hash("new-password-123")).Returns("new-hash");
        Assert.True(await new ResetPasswordUseCase(db, passwords.Object).ExecuteAsync(new()
        {
            Token = rawToken, Password = "new-password-123"
        }));
        Assert.Equal("new-hash", user.PasswordHash);
        Assert.NotNull(current.UsedAt);
    }

    private static AppDbContext CreateDatabase() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static IConfiguration Configuration() => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?> { ["IndividualCommerce:Security:PublicAppUrl"] = "http://localhost:5173" })
        .Build();
}
