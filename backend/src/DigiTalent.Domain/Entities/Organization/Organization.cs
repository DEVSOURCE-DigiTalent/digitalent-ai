using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng organizations. Tổ chức / công ty. MVP chỉ có 1 dòng.
/// </summary>
public class Organization : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
