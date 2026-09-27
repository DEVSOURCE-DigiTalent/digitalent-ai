namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng user_roles. 1 user có thể có nhiều role. Khóa chính gồm 2 cột (user_id, role_id).
/// </summary>
public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid? AssignedByUserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
}
