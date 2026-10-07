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

    /// <summary>Owning department (optional): positions are listed and filtered per department.</summary>
    public Guid? DepartmentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Grade on the shared scale G1..G3 (<see cref="JobGrades"/>); null = not graded yet.</summary>
    public string? JobGrade { get; set; }
    public string Status { get; set; } = Statuses.MasterData.Active;

    /// <summary>
    /// Nullable link to a public CareerRoleTemplate (Decision D-02, SEP-09).
    /// Allows an enterprise position to align with the platform's public career role catalog.
    /// </summary>
    public Guid? CareerRoleTemplateId { get; set; }
}
