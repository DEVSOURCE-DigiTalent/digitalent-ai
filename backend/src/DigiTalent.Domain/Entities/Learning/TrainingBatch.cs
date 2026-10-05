using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng training_batches. Đợt đào tạo của tổ chức (màn hình Tổng quan đếm số đợt RUNNING).
/// </summary>
public class TrainingBatch : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = Statuses.TrainingBatch.Draft;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public Guid CreatedByUserId { get; set; }
}
