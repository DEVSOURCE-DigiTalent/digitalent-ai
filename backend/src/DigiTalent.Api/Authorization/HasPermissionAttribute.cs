using Microsoft.AspNetCore.Authorization;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Specifies the permission code required to access this controller/action.
/// Usage: [HasPermission(PermissionConstants.EmployeeRead)]
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class HasPermissionAttribute : AuthorizeAttribute
{
    public string PermissionCode { get; }

    public HasPermissionAttribute(string permissionCode)
        : base(policy: $"permission:{permissionCode}")
    {
        PermissionCode = permissionCode;
    }
}
