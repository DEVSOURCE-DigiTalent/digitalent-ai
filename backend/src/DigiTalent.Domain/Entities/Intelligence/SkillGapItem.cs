using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng skill_gap_items. Chi tiết từng năng lực còn thiếu.
/// </summary>
public class SkillGapItem : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SkillGapRunId { get; set; }
    public Guid CompetencyId { get; set; }
    public short RequiredLevel { get; set; }
    public short? CurrentLevel { get; set; }
    public short GapSteps { get; set; }
    public decimal WeightPercent { get; set; }
    public bool Mandatory { get; set; }
    public decimal MandatoryMultiplier { get; set; }
    public decimal PriorityScore { get; set; }
    public string? Severity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
