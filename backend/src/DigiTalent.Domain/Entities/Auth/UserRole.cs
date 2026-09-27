namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng nối users - roles (khóa kép user_id + role_id). 1 user có thể có nhiều role.
/// </summary>
public class UserRole
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public Guid? AssignedByUserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }

    public User? User { get; set; }
    public Role? Role { get; set; }
}
