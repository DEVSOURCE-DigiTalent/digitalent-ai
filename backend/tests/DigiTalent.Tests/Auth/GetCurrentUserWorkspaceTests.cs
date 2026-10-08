using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Auth;

public class GetCurrentUserWorkspaceTests
{
    [Fact]
    public async Task PlatformAdminWithoutOrganizationGetsPlatformWorkspace()
    {
        await using var context = CreateContext();
        var user = new User { Email = "platform@example.com", DisplayName = "Platform" };
        var role = new Role { Code = Roles.PlatformAdmin, Name = "Platform Admin", ScopeType = "GLOBAL" };
        user.UserRoles.Add(new UserRole { User = user, Role = role });
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.UserId).Returns(user.Id);
        var permissions = new Mock<IPermissionService>();
        permissions.Setup(x => x.GetPermissionsAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(Array.Empty<string>());

        var result = await new GetCurrentUserUseCase(context, currentUser.Object, permissions.Object)
            .ExecuteAsync(new GetCurrentUserUseCaseInput());

        result.Workspace.Should().Be("platform");
        result.OnboardingStatus.Should().BeNull();
        result.Subscription.Should().BeNull();
    }

    [Fact]
    public async Task PersonalUserWithoutOrganizationKeepsLearnerRole()
    {
        await using var context = CreateContext();
        var user = new User { Email = "personal@example.com", DisplayName = "Personal" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.UserId).Returns(user.Id);
        var permissions = new Mock<IPermissionService>();
        permissions.Setup(x => x.GetPermissionsAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(Array.Empty<string>());

        var result = await new GetCurrentUserUseCase(context, currentUser.Object, permissions.Object)
            .ExecuteAsync(new GetCurrentUserUseCaseInput());

        result.Workspace.Should().Be("personal");
        result.Roles.Should().ContainSingle().Which.Should().Be("LEARNER");
    }

    [Fact]
    public async Task PersonalUserWithStaleEnterpriseRoleIsExposedAsLearner()
    {
        await using var context = CreateContext();
        var user = new User { Email = "stale-personal@example.com", DisplayName = "Personal" };
        var role = new Role { Code = Roles.Employee, Name = "Employee", ScopeType = "SELF" };
        user.UserRoles.Add(new UserRole { User = user, Role = role });
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.UserId).Returns(user.Id);
        var permissions = new Mock<IPermissionService>();
        permissions.Setup(x => x.GetPermissionsAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(Array.Empty<string>());

        var result = await new GetCurrentUserUseCase(context, currentUser.Object, permissions.Object)
            .ExecuteAsync(new GetCurrentUserUseCaseInput());

        result.Workspace.Should().Be("personal");
        result.Roles.Should().ContainSingle().Which.Should().Be("LEARNER");
        permissions.Verify(x => x.GetPermissionsAsync(
            It.Is<IReadOnlyCollection<string>>(roles => roles.SequenceEqual(new[] { "LEARNER" }))), Times.Once);
    }

    [Theory]
    [InlineData(Roles.Owner)]
    [InlineData(Roles.Manager)]
    [InlineData(Roles.Employee)]
    public async Task OrganizationRolesGetEnterpriseWorkspace(string roleCode)
    {
        await using var context = CreateContext();
        var organization = new DigiTalent.Domain.Entities.Organization { Code = $"ORG-{roleCode}", Name = roleCode };
        var user = new User
        {
            Email = $"{roleCode.ToLowerInvariant()}@example.com",
            DisplayName = roleCode,
            OrganizationId = organization.Id,
        };
        var role = new Role { Code = roleCode, Name = roleCode, ScopeType = "ORGANIZATION" };
        user.UserRoles.Add(new UserRole { User = user, Role = role });
        context.Organizations.Add(organization);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.UserId).Returns(user.Id);
        var permissions = new Mock<IPermissionService>();
        permissions.Setup(x => x.GetPermissionsAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(Array.Empty<string>());

        var result = await new GetCurrentUserUseCase(context, currentUser.Object, permissions.Object)
            .ExecuteAsync(new GetCurrentUserUseCaseInput());

        result.Workspace.Should().Be("enterprise");
        result.Roles.Should().ContainSingle().Which.Should().Be(roleCode);
    }

    private static AppDbContext CreateContext() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
}
