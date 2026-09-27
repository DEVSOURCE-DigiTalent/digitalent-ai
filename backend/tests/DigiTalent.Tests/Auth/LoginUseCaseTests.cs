using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public class LoginUseCaseTests
{
    private DbContextOptions<DigiTalent.Infrastructure.Persistence.AppDbContext> GetInMemoryOptions(string dbName) =>
        new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public void LoginRejectsInvalidEmail()
    {
        var validator = new LoginUseCaseValidator();
        var input = new LoginUseCaseInput { Email = "invalid", Password = "123" };
        var result = validator.Validate(input);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task LoginRejectsInactiveAccount()
    {
        var dbName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseInMemoryDatabase(dbName).Options;
            
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(options);
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "inactive@test.com",
            PasswordHash = "hash",
            Status = Statuses.User.Inactive,
            DisplayName = "Inactive User",
            OrganizationId = Guid.NewGuid()
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Verify("password", "hash")).Returns(true);

        var jwt = new Mock<IJwtTokenService>();

        var useCase = new LoginUseCase(context, hasher.Object, jwt.Object);
        var input = new LoginUseCaseInput { Email = "inactive@test.com", Password = "password" };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ForbiddenException>().WithMessage("Account is inactive.");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task LoginRejectsWrongPassword()
    {
        var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                      ?? "Host=localhost;Port=5432;Database=digitalent;Username=digitalent_app;Password=changeme";

        var options = new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseNpgsql(connStr)
            .UseSnakeCaseNamingConvention()
            .Options;

        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(options);
        if (!await context.Database.CanConnectAsync()) return;

        var org = await context.Organizations.FirstOrDefaultAsync();
        var orgId = org?.Id;

        var email = $"test_wrong_pwd_{Guid.NewGuid():N}@test.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = "correct_hash",
            Status = Statuses.User.Active,
            DisplayName = "Test User",
            OrganizationId = orgId
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Verify("wrong_pwd", "correct_hash")).Returns(false);

        var jwt = new Mock<IJwtTokenService>();
        var useCase = new LoginUseCase(context, hasher.Object, jwt.Object);
        var input = new LoginUseCaseInput { Email = email, Password = "wrong_pwd" };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<UnauthorizedException>().WithMessage("*Invalid email or password*");

        var updated = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
        updated!.FailedLoginCount.Should().Be(1);
    }

    [Fact]
    public async Task LoginReturnsTokenForValidCredentials()
    {
        var dbName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseInMemoryDatabase(dbName).Options;
            
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(options);
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "valid@test.com",
            PasswordHash = "hash",
            Status = Statuses.User.Active,
            DisplayName = "Valid User",
            OrganizationId = Guid.NewGuid()
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Verify("password", "hash")).Returns(true);

        var jwt = new Mock<IJwtTokenService>();
        var expiresAt = DateTimeOffset.UtcNow.AddHours(1);
        jwt.Setup(j => j.CreateToken(It.IsAny<User>(), It.IsAny<IReadOnlyCollection<string>>()))
            .Returns((new DigiTalent.Application.Common.Interfaces.JwtTokenResult { AccessToken = "token", ExpiresAt = expiresAt }));

        var useCase = new LoginUseCase(context, hasher.Object, jwt.Object);
        var input = new LoginUseCaseInput { Email = "valid@test.com", Password = "password" };

        var result = await useCase.ExecuteAsync(input);

        result.Should().NotBeNull();
        result.AccessToken.Should().Be("token");
        result.ExpiresAt.Should().Be(expiresAt);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task LoginLocksAccountAfterMaxFailedAttempts()
    {
        var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                      ?? "Host=localhost;Port=5432;Database=digitalent;Username=digitalent_app;Password=changeme";

        var options = new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseNpgsql(connStr)
            .UseSnakeCaseNamingConvention()
            .Options;

        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(options);
        if (!await context.Database.CanConnectAsync()) return;

        var org = await context.Organizations.FirstOrDefaultAsync();
        var orgId = org?.Id;

        var email = $"test_lock_{Guid.NewGuid():N}@test.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = "correct_hash",
            Status = Statuses.User.Active,
            DisplayName = "Locked Test User",
            FailedLoginCount = 4,
            OrganizationId = orgId
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Verify("wrong_pwd", "correct_hash")).Returns(false);

        var jwt = new Mock<IJwtTokenService>();
        var useCase = new LoginUseCase(context, hasher.Object, jwt.Object);
        var input = new LoginUseCaseInput { Email = email, Password = "wrong_pwd" };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<UnauthorizedException>();

        var updated = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
        updated!.LockedUntil.Should().NotBeNull();
        updated.LockedUntil.Should().BeAfter(DateTimeOffset.UtcNow);
    }
}
