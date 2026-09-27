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

    [Fact(Skip = "Requires PostgreSQL due to ExecuteUpdateAsync not supported by InMemory")]
    [Trait("Category", "Integration")]
    public async Task LoginRejectsWrongPassword()
    {
        // Skipped because InMemory does not support ExecuteUpdateAsync used in RecordFailedLoginAsync
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

    [Fact(Skip = "Requires PostgreSQL due to ExecuteUpdateAsync")]
    [Trait("Category", "Integration")]
    public async Task LoginLocksAccountAfterMaxFailedAttempts()
    {
        // Skipped due to InMemory lack of support for ExecuteUpdateAsync
    }
}
