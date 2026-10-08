using DigiTalent.Domain.Constants.Authorization;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Validates the three organization-scoped roles managed by the members API.
/// </summary>
public static class MemberRoles
{
    public const string Owner = "OWNER";
    public const string Manager = "MANAGER";
    public const string Employee = "EMPLOYEE";

    /// <summary>Enterprise roles in display order (highest first).</summary>
    public static readonly IReadOnlyList<string> All = new[] { Owner, Manager, Employee };

    /// <summary>Organization roles the members API grants and revokes.</summary>
    public static readonly IReadOnlyList<string> ManagedRoleCodes = new[] { Roles.Owner, Roles.Manager, Roles.Employee };

    /// <summary>System role → enterprise role; null for an unknown code.</summary>
    public static string? FromRoleCode(string roleCode) => roleCode switch
    {
        Roles.Owner => Owner,
        Roles.Manager => Manager,
        Roles.Employee => Employee,
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
        Roles.Owner => Roles.Owner,
        Roles.Manager => Roles.Manager,
        Roles.Employee => Roles.Employee,
        _ => null,
    };

    /// <summary>System roles that count as the given enterprise role (used by the role filter and member counts).</summary>
    public static IReadOnlyList<string> RoleCodesOf(string role) => role.Trim().ToUpperInvariant() switch
    {
        Owner => new[] { Roles.Owner },
        Manager => new[] { Roles.Manager },
        Employee => new[] { Roles.Employee },
        var code => new[] { code }, // already a system role code
    };
}
