using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng system_settings. Cấu hình hệ thống.
/// </summary>
public class SystemSetting : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OrganizationId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
