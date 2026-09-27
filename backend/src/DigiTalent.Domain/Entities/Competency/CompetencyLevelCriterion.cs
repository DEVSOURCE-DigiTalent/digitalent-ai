using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_level_criteria. Tiêu chí đánh giá từng bậc của năng lực (bậc 1-3).
/// </summary>
public class CompetencyLevelCriterion : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompetencyId { get; set; }
    public short Level { get; set; }
    public string IndicatorCode { get; set; } = string.Empty;
    public string BehaviorIndicator { get; set; } = string.Empty;
    public string? AssessmentGuidance { get; set; }
    public string? EvidenceGuidance { get; set; }
    public string? SourceNote { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
