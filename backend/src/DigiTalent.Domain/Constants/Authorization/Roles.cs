namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Four persisted roles for platform and enterprise workspaces.
/// Personal accounts have no persisted enterprise role and are exposed as LEARNER by /auth/me.
/// </summary>
public static class Roles
{
    public const string PlatformAdmin = "PLATFORM_ADMIN";
    public const string Owner = "OWNER";
    public const string Manager = "MANAGER";
    public const string Employee = "EMPLOYEE";

    /// <summary>
    /// Chuyển đổi mã vai trò về chuẩn 4 roles (PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE).
    /// </summary>
    public static string Canonicalize(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) return string.Empty;
        var upper = code.Trim().ToUpperInvariant();
        return upper switch
        {
            PlatformAdmin or "SYSTEM_ADMIN" or "ADMIN" => PlatformAdmin,
            Owner or "HR_MANAGER" or "BUSINESS_OWNER" => Owner,
            Manager or "DEPARTMENT_MANAGER" => Manager,
            Employee or "TRAINER" or "STAFF" => Employee,
            _ => upper
        };
    }

    /// <summary>
    /// Thông tin để seed bảng roles: mã, tên hiển thị, phạm vi dữ liệu (roles.scope_type).
    /// </summary>
    public static readonly IReadOnlyList<(string Code, string Name, string ScopeType)> Definitions = new[]
    {
        (PlatformAdmin, "Platform Administrator", "GLOBAL"),
        (Owner, "Enterprise Owner", "ORGANIZATION"),
        (Manager, "Department Manager", "DEPARTMENT"),
        (Employee, "Employee", "SELF"),
    };
}
