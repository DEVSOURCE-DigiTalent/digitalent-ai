using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Nhật ký thao tác nhạy cảm (chỉ thêm, không sửa). OldValues/NewValues là chuỗi JSON (cột jsonb).
/// </summary>
public class AuditLog : BaseEntity
{
    public Guid? OrganizationId { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpHash { get; set; }
}
