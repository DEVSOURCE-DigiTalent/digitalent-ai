using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public sealed class BusinessEmailVerificationTests
{
    [Fact]
    public async Task Failed_resend_keeps_the_previous_otp_usable()
    {
        using var db = Database();
        var user = new User { Email = "owner@example.test", DisplayName = "Owner", PasswordHash = "hash" };
        db.Users.Add(user);
        var previous = new PasswordResetToken
        {
            UserId = user.Id, Purpose = TokenPurpose.VerifyEmail,
            TokenHash = SendEmailVerificationUseCase.HashOtp("123456"),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10)
        };
        db.PasswordResetTokens.Add(previous);
        await db.SaveChangesAsync();
        previous.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2);
        await db.SaveChangesAsync();
        var sender = new Mock<IEmailVerificationSender>();
        sender.Setup(x => x.SendOtpAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("SMTP unavailable"));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            new SendEmailVerificationUseCase(db, sender.Object, Configuration()).ExecuteAsync(new() { Email = user.Email }));

        Assert.Null(previous.UsedAt);
        Assert.Single(await db.PasswordResetTokens.ToListAsync());
        Assert.True((await new VerifyBusinessEmailUseCase(db).ExecuteAsync(new() { Email = user.Email, Otp = "123456" })).Verified);
    }

    [Fact]
    public async Task Successful_resend_revokes_old_code_and_does_not_expose_sent_code()
    {
        using var db = Database();
        var user = new User { Email = "owner@example.test", DisplayName = "Owner", PasswordHash = "hash" };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        var sender = new Mock<IEmailVerificationSender>();
        sender.Setup(x => x.SendOtpAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string?)null);

        var result = await new SendEmailVerificationUseCase(db, sender.Object, Configuration())
            .ExecuteAsync(new() { Email = user.Email });

        Assert.Null(result.DebugOtp);
        Assert.Single(await db.PasswordResetTokens.ToListAsync());
    }

    private static AppDbContext Database() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static IConfiguration Configuration() => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?> { ["ASPNETCORE_ENVIRONMENT"] = "Development" })
        .Build();
}
