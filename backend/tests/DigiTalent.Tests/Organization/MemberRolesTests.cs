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
    [InlineData(Roles.SystemAdmin, MemberRoles.Owner)]
    [InlineData(Roles.HrManager, MemberRoles.Owner)]
    [InlineData(Roles.DepartmentManager, MemberRoles.Manager)]
    [InlineData(Roles.Employee, MemberRoles.Employee)]
    [InlineData(Roles.Trainer, MemberRoles.Employee)]
    public void FromRoleCode_MapsSystemRolesToEnterpriseRoles(string roleCode, string expected) =>
        MemberRoles.FromRoleCode(roleCode).Should().Be(expected);

    [Theory]
    [InlineData("owner", Roles.HrManager)]
    [InlineData(MemberRoles.Manager, Roles.DepartmentManager)]
    [InlineData(Roles.HrManager, Roles.HrManager)]
    [InlineData(MemberRoles.Employee, Roles.Employee)]
    [InlineData(Roles.SystemAdmin, null)] // never granted from the organization
    [InlineData(Roles.Trainer, null)]
    [InlineData("SUPER", null)]
    public void ToRoleCode_OnlyGrantsTheThreeEnterpriseRoles(string role, string? expected) =>
        MemberRoles.ToRoleCode(role).Should().Be(expected);

    [Fact]
    public void FromRoleCodes_ReturnsDistinctRolesHighestFirst() =>
        MemberRoles.FromRoleCodes(new[] { Roles.Trainer, Roles.HrManager, Roles.Employee })
            .Should().Equal(MemberRoles.Owner, MemberRoles.Employee);

    [Fact]
    public void HrManager_HasThePermissionsOfTheOrganizationScreens()
    {
        var permissions = RolePermissions.Defaults[Roles.HrManager];

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
