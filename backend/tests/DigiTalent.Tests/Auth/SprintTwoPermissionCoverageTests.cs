using DigiTalent.Domain.Constants.Authorization;
using Xunit;

namespace DigiTalent.Tests.Auth;

public class SprintTwoPermissionCoverageTests
{
    [Theory]
    [InlineData("employee.read")]
    [InlineData("employee.create_update")]
    [InlineData("competency.read")]
    [InlineData("competency.create_update")]
    [InlineData("position_requirement.read")]
    [InlineData("position_requirement.create_update")]
    public void SprintTwo_RequiredPermissions_AreDefinedInPermissionsAll(string permission)
    {
        var allPermissions = Permissions.All();
        Assert.Contains(permission, allPermissions);
    }

    [Fact]
    public void SprintTwo_HrManager_HasAllSprintTwoManagementPermissions()
    {
        Assert.True(RolePermissions.Defaults.TryGetValue(Roles.Owner, out var hrPerms));
        Assert.NotNull(hrPerms);

        Assert.Contains(Permissions.Employee.Read, hrPerms);
        Assert.Contains(Permissions.Employee.CreateUpdate, hrPerms);
        Assert.Contains(Permissions.Competency.Read, hrPerms);
        Assert.Contains(Permissions.Competency.CreateUpdate, hrPerms);
        Assert.Contains(Permissions.PositionRequirement.Read, hrPerms);
        Assert.Contains(Permissions.PositionRequirement.CreateUpdate, hrPerms);
    }

    [Fact]
    public void SprintTwo_RegularEmployee_CannotCreateUpdateEmployees()
    {
        Assert.True(RolePermissions.Defaults.TryGetValue(Roles.Employee, out var empPerms));
        Assert.NotNull(empPerms);

        Assert.DoesNotContain(Permissions.Employee.CreateUpdate, empPerms);
    }
}
