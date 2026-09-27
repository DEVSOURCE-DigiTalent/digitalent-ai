using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng job_families. Nhóm ngành nghề, gom nhiều chức danh cùng loại.
/// </summary>
public class JobFamily : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
