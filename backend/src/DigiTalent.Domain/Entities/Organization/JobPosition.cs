using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Vị trí công việc (VD: Sales Executive). Thăng tiến = chuyển sang vị trí khác; KHÔNG có CareerGrade.
/// </summary>
public class JobPosition : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? JobFamilyId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = Statuses.MasterData.Active;
}
