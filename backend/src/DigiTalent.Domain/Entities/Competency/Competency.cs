using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Năng lực cụ thể thuộc một danh mục.
/// Status: DRAFT, ACTIVE, ARCHIVED.
/// CompetencyType: CORE_DIGITAL, PROFESSIONAL, INTERNAL, BEHAVIOURAL.
/// </summary>
public class Competency : BaseEntity
{
    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CompetencyType { get; set; } = Statuses.CompetencyType.CoreDigital;
    public string Status { get; set; } = Statuses.Competency.Active;

    public CompetencyCategory? Category { get; set; }
    public List<CompetencyLevelCriterion> Criteria { get; set; } = new();
}
