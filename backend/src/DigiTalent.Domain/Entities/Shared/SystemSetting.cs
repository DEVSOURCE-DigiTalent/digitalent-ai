using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Cấu hình hệ thống dạng key/value (value là chuỗi JSON, cột jsonb).
/// OrganizationId = null → cấu hình toàn cục. KHÔNG lưu secret (API key...) ở đây.
/// </summary>
public class SystemSetting : BaseEntity
{
    public Guid? OrganizationId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = "null";
    public string? Description { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
