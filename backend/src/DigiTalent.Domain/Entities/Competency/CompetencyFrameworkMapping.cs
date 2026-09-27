using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_framework_mappings. Ánh xạ năng lực của mình sang khung năng lực bên ngoài.
/// </summary>
public class CompetencyFrameworkMapping : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompetencyId { get; set; }
    public Guid FrameworkId { get; set; }
    public string? SourceAreaCode { get; set; }
    public string SourceCode { get; set; } = string.Empty;
    public string? SourceName { get; set; }
    public string? SourceLevelText { get; set; }
    public string Relationship { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string? MappingNote { get; set; }
    public string? SourceUrl { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
