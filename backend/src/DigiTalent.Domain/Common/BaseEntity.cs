namespace DigiTalent.Domain.Common;

/// <summary>
/// Lớp cha của mọi entity: có sẵn Id và thời gian tạo/sửa.
/// CreatedAt / UpdatedAt được AppDbContext tự điền khi SaveChanges — không cần gán tay.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
