using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng capability_ceilings (canonical v3.2 §18.1). Cấp cao nhất mở cho một lĩnh vực năng lực (competency_categories):
/// DepartmentId = null là trần doanh nghiệp, có DepartmentId là trần riêng của phòng ban.
/// Quy tắc: trần phòng ban ≤ trần doanh nghiệp ≤ trần Digital AI (<see cref="MaxLevel"/>), xét từng lĩnh vực.
/// </summary>
public class CapabilityCeiling : BaseEntity
{
    /// <summary>Trần Digital AI: 3 cấp (Cơ bản, Trung cấp, Nâng cao) cho mỗi lĩnh vực.</summary>
    public const short MaxLevel = 3;

    public Guid OrganizationId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid CompetencyCategoryId { get; set; }

    /// <summary>0 = không mở lĩnh vực, 1–3 = Cơ bản / Trung cấp / Nâng cao.</summary>
    public short CeilingLevel { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
