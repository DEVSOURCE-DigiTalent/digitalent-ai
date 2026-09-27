using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng audit_logs. Nhật ký thao tác quan trọng.
/// </summary>
public class AuditLog : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OrganizationId { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpHash { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
