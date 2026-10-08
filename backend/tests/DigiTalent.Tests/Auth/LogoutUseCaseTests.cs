using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public class LogoutUseCaseTests
{
    [Fact]
    public async Task LogoutRevokesPresentedRefreshToken()
    {
        await using var context = CreateContext();
        var token = new RefreshToken
        {
            UserId = Guid.NewGuid(),
            TokenHash = "hash-of-current-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
        };
        context.RefreshTokens.Add(token);
        await context.SaveChangesAsync();

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(x => x.HashRefreshToken("current-token")).Returns(token.TokenHash);

        var useCase = new LogoutUseCase(context, jwt.Object);
        await useCase.ExecuteAsync(new LogoutUseCaseInput { RefreshToken = "current-token" });

        (await context.RefreshTokens.FindAsync(token.Id))!.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task LogoutWithUnknownTokenIsIdempotent()
    {
        await using var context = CreateContext();
        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(x => x.HashRefreshToken("unknown-token")).Returns("missing-hash");

        var useCase = new LogoutUseCase(context, jwt.Object);
        var act = async () => await useCase.ExecuteAsync(new LogoutUseCaseInput { RefreshToken = "unknown-token" });

        await act.Should().NotThrowAsync();
    }

    private static AppDbContext CreateContext() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
}
