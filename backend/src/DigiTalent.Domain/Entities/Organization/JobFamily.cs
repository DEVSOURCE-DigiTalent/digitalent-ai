using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Nhóm vị trí công việc (VD: Sales, Human Resources).
/// </summary>
public class JobFamily : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = Statuses.MasterData.Active;
}
