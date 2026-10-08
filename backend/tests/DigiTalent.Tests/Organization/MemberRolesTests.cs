using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Organization;

/// <summary>
/// Enterprise roles (frontend) ↔ system roles (database), and the permissions the Owner needs on the organization screens.
/// </summary>
public class MemberRolesTests
{
    [Theory]
    [InlineData(Roles.Owner, MemberRoles.Owner)]
    [InlineData(Roles.Manager, MemberRoles.Manager)]
    [InlineData(Roles.Employee, MemberRoles.Employee)]
    public void FromRoleCode_MapsSystemRolesToEnterpriseRoles(string roleCode, string expected) =>
        MemberRoles.FromRoleCode(roleCode).Should().Be(expected);

    [Theory]
    [InlineData("owner", Roles.Owner)]
    [InlineData(MemberRoles.Manager, Roles.Manager)]
    [InlineData(Roles.Owner, Roles.Owner)]
    [InlineData(MemberRoles.Employee, Roles.Employee)]
    [InlineData(Roles.PlatformAdmin, null)] // never granted from the organization
    [InlineData("SUPER", null)]
    public void ToRoleCode_OnlyGrantsTheThreeEnterpriseRoles(string role, string? expected) =>
        MemberRoles.ToRoleCode(role).Should().Be(expected);

    [Fact]
    public void FromRoleCodes_ReturnsDistinctRolesHighestFirst() =>
        MemberRoles.FromRoleCodes(new[] { Roles.Owner, Roles.Employee, Roles.Employee })
            .Should().Equal(MemberRoles.Owner, MemberRoles.Employee);

    [Fact]
    public void Owner_HasThePermissionsOfTheOrganizationScreens()
    {
        var permissions = RolePermissions.Defaults[Roles.Owner];

        permissions.Should().Contain(new[]
        {
            Permissions.UserRole.UserRead,
            Permissions.UserRole.UserCreate,
            Permissions.UserRole.UserUpdate,
            Permissions.UserRole.UserLockUnlock,
            Permissions.UserRole.RoleRead,
            Permissions.UserRole.RoleAssignBusiness,
            Permissions.JobGrade.Read,
            Permissions.JobGrade.Manage,
        });
        Permissions.All().Should().Contain(new[] { "job_grade.read", "job_grade.manage" });
        RolePermissions.Defaults[Roles.Employee].Should().NotContain(Permissions.UserRole.UserRead);
    }
}
