using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Danh mục năng lực (VD: Digital Foundations, Professional Skills).
/// Scope theo OrganizationId.
/// </summary>
public class CompetencyCategory : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;
    public string Status { get; set; } = Statuses.MasterData.Active;

    public List<Competency> Competencies { get; set; } = new();
}
