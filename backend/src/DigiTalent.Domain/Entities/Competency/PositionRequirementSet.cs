using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng position_requirement_sets. Bộ yêu cầu năng lực của 1 chức danh, có đánh phiên bản.
/// </summary>
public class PositionRequirementSet : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobPositionId { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid? ActivatedByUserId { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public long RowVersion { get; set; }
}
