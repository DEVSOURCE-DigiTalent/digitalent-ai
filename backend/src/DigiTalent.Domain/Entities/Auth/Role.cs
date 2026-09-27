using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng roles. Mã role xem trong Constants/Authorization/Roles.cs.
/// </summary>
public class Role : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScopeType { get; set; } = "ORGANIZATION"; // GLOBAL / ORGANIZATION / DEPARTMENT / SELF
    public string Status { get; set; } = "ACTIVE";

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
