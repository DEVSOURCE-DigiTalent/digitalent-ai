using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bộ yêu cầu năng lực theo phiên bản (versioned) cho một vị trí công việc (JobPosition).
/// Status: DRAFT, ACTIVE, ARCHIVED.
/// Chỉ có tối đa 1 phiên bản ACTIVE cho mỗi JobPosition.
/// </summary>
public class PositionRequirementSet : BaseEntity
{
    public Guid JobPositionId { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = Statuses.PositionRequirementSet.Draft;
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid? ActivatedByUserId { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }
    public long RowVersion { get; set; } = 1;

    public JobPosition? JobPosition { get; set; }
    public List<PositionRequirementItem> Items { get; set; } = new();
}
