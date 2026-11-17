using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_milestones (canonical v3.9). Mốc năng lực mà doanh nghiệp đặt cho một lĩnh vực (competency_categories),
/// áp dụng cho cả doanh nghiệp và đặt được trước khi mua khóa học (khác trần <see cref="CapabilityCeiling"/>).
/// Báo cáo khảo sát dùng thử so mức của nhân viên với mốc này.
/// </summary>
public class CompetencyMilestone : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid CompetencyCategoryId { get; set; }

    /// <summary>0 = chưa đặt (dùng mức tham chiếu theo vị trí), 1–3 = Cơ bản / Trung cấp / Nâng cao.</summary>
    public short MilestoneLevel { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
