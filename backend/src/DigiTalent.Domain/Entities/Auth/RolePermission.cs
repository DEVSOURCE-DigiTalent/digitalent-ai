namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng role_permissions. Role nào có quyền nào. Khóa chính gồm 2 cột.
/// </summary>
public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}
