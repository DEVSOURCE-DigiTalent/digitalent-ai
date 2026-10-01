using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_frameworks. Khung năng lực tham chiếu bên ngoài.
/// </summary>
public class CompetencyFramework : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Authority { get; set; }
    public string? Jurisdiction { get; set; }
    public string? SourceUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
