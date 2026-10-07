using DigiTalent.Domain.Constants.Authorization;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Maps the 3 enterprise roles shown by the frontend (OWNER, MANAGER, EMPLOYEE) to the 5 system roles stored in
/// the database (frontend lib/roles.ts LEGACY_ROLE_MAP does the same in the other direction):
///   OWNER    ↔ HR_MANAGER   (SYSTEM_ADMIN is also shown as OWNER but is never granted here)
///   MANAGER  ↔ DEPARTMENT_MANAGER
///   EMPLOYEE ↔ EMPLOYEE     (TRAINER is also shown as EMPLOYEE)
/// </summary>
public static class MemberRoles
{
    public const string Owner = "OWNER";
    public const string Manager = "MANAGER";
    public const string Employee = "EMPLOYEE";

    /// <summary>Enterprise roles in display order (highest first).</summary>
    public static readonly IReadOnlyList<string> All = new[] { Owner, Manager, Employee };

    /// <summary>System roles the members API grants and revokes. Other roles (SYSTEM_ADMIN, TRAINER) are left untouched.</summary>
    public static readonly IReadOnlyList<string> ManagedRoleCodes = new[] { Roles.HrManager, Roles.DepartmentManager, Roles.Employee };

    /// <summary>System role → enterprise role; null for an unknown code.</summary>
    public static string? FromRoleCode(string roleCode) => roleCode switch
    {
        Roles.SystemAdmin or Roles.HrManager => Owner,
        Roles.DepartmentManager => Manager,
        Roles.Employee or Roles.Trainer => Employee,
        _ => null,
    };

    /// <summary>System roles of a user → distinct enterprise roles, highest first.</summary>
    public static List<string> FromRoleCodes(IEnumerable<string> roleCodes)
    {
        var mapped = roleCodes.Select(FromRoleCode).Where(role => role != null).ToHashSet();
        return All.Where(mapped.Contains).ToList();
    }

    /// <summary>
    /// Enterprise role (or the system code itself, for API clients that send it) → system role to grant;
    /// null when the role cannot be granted through the members API.
    /// </summary>
    public static string? ToRoleCode(string? role) => role?.Trim().ToUpperInvariant() switch
    {
        Owner or Roles.HrManager => Roles.HrManager,
        Manager or Roles.DepartmentManager => Roles.DepartmentManager,
        Employee or Roles.Employee => Roles.Employee,
        _ => null,
    };

    /// <summary>System roles that count as the given enterprise role (used by the role filter and member counts).</summary>
    public static IReadOnlyList<string> RoleCodesOf(string role) => role.Trim().ToUpperInvariant() switch
    {
        Owner => new[] { Roles.SystemAdmin, Roles.HrManager },
        Manager => new[] { Roles.DepartmentManager },
        Employee => new[] { Roles.Employee, Roles.Trainer },
        var code => new[] { code }, // already a system role code
    };
}
