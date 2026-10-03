namespace DigiTalent.Domain.Entities;

/// <summary>
/// Ma trận phân quyền: role nào có permission nào (khóa kép role_id + permission_id).
/// </summary>
public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}
