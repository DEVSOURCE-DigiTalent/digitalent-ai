namespace DigiTalent.Application.UseCases.Organization.Access;

/// <summary>
/// Serialized as a JSON array (frontend memberService.getRoles() expects RoleSummary[]).
/// </summary>
public class GetRolesUseCaseOutput : List<RoleSummary>
{
}

/// <summary>
/// One enterprise role (frontend services/member.service.ts RoleSummary, extended with the permission codes).
/// </summary>
public class RoleSummary
{
    /// <summary>OWNER | MANAGER | EMPLOYEE.</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>System role granted for it (HR_MANAGER | DEPARTMENT_MANAGER | EMPLOYEE).</summary>
    public string RoleCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<string> Can { get; set; } = new();

    /// <summary>Permission codes of <see cref="RoleCode"/> from role_permissions.</summary>
    public List<string> Permissions { get; set; } = new();

    /// <summary>Active accounts of the organization holding the role.</summary>
    public int MemberCount { get; set; }

    /// <summary>Whether the caller may grant or revoke the role.</summary>
    public bool Assignable { get; set; }
}
