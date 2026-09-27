using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Chi tiết yêu cầu năng lực trong một bộ yêu cầu của vị trí công việc.
/// Level: 1..3. WeightPercent: > 0 và <= 100.
/// </summary>
public class PositionRequirementItem : BaseEntity
{
    public Guid RequirementSetId { get; set; }
    public Guid CompetencyId { get; set; }
    public int RequiredLevel { get; set; }
    public decimal WeightPercent { get; set; }
    public bool IsMandatory { get; set; } = true;
    public bool RequiresPracticalEvidence { get; set; } = true;
    public string? Note { get; set; }

    public PositionRequirementSet? RequirementSet { get; set; }
    public Competency? Competency { get; set; }
}
