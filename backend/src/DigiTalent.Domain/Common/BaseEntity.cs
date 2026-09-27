namespace DigiTalent.Domain.Common;

/// <summary>
/// Lớp cha của mọi entity có khóa Id: có sẵn Id và thời gian tạo/sửa.
/// CreatedAt / UpdatedAt được AppDbContext tự điền khi SaveChanges — không cần gán tay.
/// (Bảng nối khóa kép như user_roles, role_permissions KHÔNG kế thừa lớp này.)
/// </summary>
public abstract class BaseEntity : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
