using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng position_requirement_items. Từng năng lực trong bộ yêu cầu, kèm bậc và trọng số.
/// </summary>
public class PositionRequirementItem : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequirementSetId { get; set; }
    public Guid CompetencyId { get; set; }
    public short RequiredLevel { get; set; }
    public decimal WeightPercent { get; set; }
    public bool IsMandatory { get; set; }
    public bool RequiresPracticalEvidence { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
