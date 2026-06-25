using Microsoft.AspNetCore.Authorization;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Represents a requirement that the current user has the specified permission code.
/// Used by PermissionAuthorizationHandler to evaluate access.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionCode { get; }

    public PermissionRequirement(string permissionCode)
    {
        PermissionCode = permissionCode;
    }
}
