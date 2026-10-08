using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public class RefreshTokenUseCaseTests
{
    [Fact]
    public async Task RefreshToken_WithValidToken_RotatesTokenAndRevokesOld()
    {
        var dbName = Guid.NewGuid().ToString();
        await using var context = CreateContext(dbName);

        var user = new User
        {
            Email = "employee@digitalent.ai",
            DisplayName = "Employee User",
            Status = Statuses.User.Active,
        };
        var role = new Role { Code = Roles.Employee, Name = "Employee", ScopeType = "SELF" };
        user.UserRoles.Add(new UserRole { User = user, Role = role });
        context.Users.Add(user);

        var oldToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = "hash-of-old-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
        };
        context.RefreshTokens.Add(oldToken);
        await context.SaveChangesAsync();

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(j => j.HashRefreshToken("raw-old-token")).Returns("hash-of-old-token");
        jwt.Setup(j => j.HashRefreshToken("raw-new-token")).Returns("hash-of-new-token");
        jwt.Setup(j => j.CreateToken(It.IsAny<User>(), It.IsAny<IEnumerable<string>>(), It.IsAny<Guid?>(), It.IsAny<Guid?>()))
            .Returns(new JwtTokenResult
            {
                AccessToken = "access-token-123",
                RefreshToken = "raw-new-token",
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15),
                RefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            });

        var useCase = new RefreshTokenUseCase(context, jwt.Object);
        var output = await useCase.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "raw-old-token" });

        output.AccessToken.Should().Be("access-token-123");
        output.RefreshToken.Should().Be("raw-new-token");

        var refreshedOldToken = await context.RefreshTokens.FindAsync(oldToken.Id);
        refreshedOldToken.Should().NotBeNull();
        refreshedOldToken!.RevokedAt.Should().NotBeNull();
        refreshedOldToken.ReplacedByTokenId.Should().NotBeNull();

        var newToken = await context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == "hash-of-new-token");
        newToken.Should().NotBeNull();
        newToken!.UserId.Should().Be(user.Id);
        newToken.RevokedAt.Should().BeNull();
        refreshedOldToken.ReplacedByTokenId.Should().Be(newToken.Id);
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ThrowsUnauthorized()
    {
        var dbName = Guid.NewGuid().ToString();
        await using var context = CreateContext(dbName);

        var user = new User
        {
            Email = "employee@digitalent.ai",
            DisplayName = "Employee User",
            Status = Statuses.User.Active,
        };
        context.Users.Add(user);

        var expiredToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = "hash-of-expired-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-10),
        };
        context.RefreshTokens.Add(expiredToken);
        await context.SaveChangesAsync();

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(j => j.HashRefreshToken("expired-token")).Returns("hash-of-expired-token");

        var useCase = new RefreshTokenUseCase(context, jwt.Object);
        var act = async () => await useCase.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "expired-token" });

        await act.Should().ThrowAsync<UnauthorizedException>()
            .WithMessage("*expired*");
    }

    [Fact]
    public async Task RefreshToken_WithRevokedToken_TriggersReuseDetectionAndRevokesAllActiveTokens()
    {
        var dbName = Guid.NewGuid().ToString();
        await using var context = CreateContext(dbName);

        var user = new User
        {
            Email = "employee@digitalent.ai",
            DisplayName = "Employee User",
            Status = Statuses.User.Active,
        };
        context.Users.Add(user);

        var revokedToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = "hash-of-revoked-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            RevokedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
        };
        var activeToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = "hash-of-active-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(2),
            RevokedAt = null,
        };
        context.RefreshTokens.AddRange(revokedToken, activeToken);
        await context.SaveChangesAsync();

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(j => j.HashRefreshToken("revoked-token")).Returns("hash-of-revoked-token");

        var useCase = new RefreshTokenUseCase(context, jwt.Object);
        var act = async () => await useCase.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "revoked-token" });

        await act.Should().ThrowAsync<UnauthorizedException>()
            .WithMessage("*previously revoked*");

        var reloadedActiveToken = await context.RefreshTokens.FindAsync(activeToken.Id);
        reloadedActiveToken!.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RefreshToken_WhenUserLocked_ThrowsForbiddenException()
    {
        var dbName = Guid.NewGuid().ToString();
        await using var context = CreateContext(dbName);

        var user = new User
        {
            Email = "locked@digitalent.ai",
            DisplayName = "Locked User",
            Status = Statuses.User.Locked,
            LockedUntil = DateTimeOffset.UtcNow.AddHours(2),
        };
        context.Users.Add(user);

        var token = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = "hash-of-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
        };
        context.RefreshTokens.Add(token);
        await context.SaveChangesAsync();

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(j => j.HashRefreshToken("raw-token")).Returns("hash-of-token");

        var useCase = new RefreshTokenUseCase(context, jwt.Object);
        var act = async () => await useCase.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "raw-token" });

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*locked*");
    }

    [Fact]
    public async Task RefreshToken_ConcurrentRequests_OnlyOneSucceedsAndOtherIsRejected()
    {
        var dbName = Guid.NewGuid().ToString();
        await using (var seedContext = CreateContext(dbName))
        {
            var user = new User
            {
                Email = "concurrent@digitalent.ai",
                DisplayName = "Concurrent User",
                Status = Statuses.User.Active,
            };
            var role = new Role { Code = Roles.Employee, Name = "Employee", ScopeType = "SELF" };
            user.UserRoles.Add(new UserRole { User = user, Role = role });
            seedContext.Users.Add(user);

            var token = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = "hash-concurrent-token",
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            };
            seedContext.RefreshTokens.Add(token);
            await seedContext.SaveChangesAsync();
        }

        var jwt = new Mock<IJwtTokenService>();
        jwt.Setup(j => j.HashRefreshToken("concurrent-token")).Returns("hash-concurrent-token");
        jwt.Setup(j => j.HashRefreshToken(It.Is<string>(s => s != "concurrent-token")))
            .Returns<string>(s => "hash-" + s);
        jwt.Setup(j => j.CreateToken(It.IsAny<User>(), It.IsAny<IEnumerable<string>>(), It.IsAny<Guid?>(), It.IsAny<Guid?>()))
            .Returns(() => new JwtTokenResult
            {
                AccessToken = Guid.NewGuid().ToString(),
                RefreshToken = Guid.NewGuid().ToString(),
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15),
                RefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            });

        await using var context1 = CreateContext(dbName);
        await using var context2 = CreateContext(dbName);

        var useCase1 = new RefreshTokenUseCase(context1, jwt.Object);
        var useCase2 = new RefreshTokenUseCase(context2, jwt.Object);

        var task1 = Task.Run(async () =>
        {
            try { return (Success: true, Output: await useCase1.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "concurrent-token" }), Exception: (Exception?)null); }
            catch (Exception ex) { return (Success: false, Output: (RefreshTokenUseCaseOutput?)null, Exception: (Exception?)ex); }
        });

        var task2 = Task.Run(async () =>
        {
            try { return (Success: true, Output: await useCase2.ExecuteAsync(new RefreshTokenUseCaseInput { RefreshToken = "concurrent-token" }), Exception: (Exception?)null); }
            catch (Exception ex) { return (Success: false, Output: (RefreshTokenUseCaseOutput?)null, Exception: (Exception?)ex); }
        });

        var results = await Task.WhenAll(task1, task2);

        var successCount = results.Count(r => r.Success);
        var failureCount = results.Count(r => !r.Success);

        successCount.Should().Be(1, "exactly one concurrent refresh rotation must succeed");
        failureCount.Should().Be(1, "the losing concurrent refresh request must fail");
        results.First(r => !r.Success).Exception.Should().BeOfType<UnauthorizedException>();
    }

    private static AppDbContext CreateContext(string dbName) => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options);
}
