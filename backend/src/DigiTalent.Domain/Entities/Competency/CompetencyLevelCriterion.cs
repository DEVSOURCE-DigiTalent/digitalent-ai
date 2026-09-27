using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Tiêu chí hành vi / bằng chứng theo từng cấp độ (1..3) của năng lực.
/// </summary>
public class CompetencyLevelCriterion : BaseEntity
{
    public Guid CompetencyId { get; set; }
    public int Level { get; set; }
    public string IndicatorCode { get; set; } = string.Empty;
    public string BehaviorIndicator { get; set; } = string.Empty;
    public string? AssessmentGuidance { get; set; }
    public string? EvidenceGuidance { get; set; }
    public string? SourceNote { get; set; }
    public int SortOrder { get; set; } = 0;

    public Competency? Competency { get; set; }
}
