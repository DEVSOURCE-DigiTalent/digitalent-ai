using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng permissions. Code có dạng "department.read" (doc 09 mục 6).
/// </summary>
public class Permission : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
