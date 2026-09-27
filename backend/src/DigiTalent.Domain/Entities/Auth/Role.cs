using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Vai trò hệ thống (bảng roles). Mã role: Constants/Authorization/Roles.cs.
/// </summary>
public class Role : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScopeType { get; set; } = string.Empty; // GLOBAL / ORGANIZATION / DEPARTMENT / SELF
    public string Status { get; set; } = Statuses.Simple.Active;

    public List<RolePermission> RolePermissions { get; set; } = new();
}
