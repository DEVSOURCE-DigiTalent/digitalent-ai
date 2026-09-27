using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Phòng ban. Có phòng ban cha (dạng cây) và trưởng phòng (1 Employee).
/// Không xóa cứng: chuyển Status = ARCHIVED.
/// </summary>
public class Department : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = Statuses.MasterData.Active;
}

/// <summary>
/// Các giá trị dùng cho cột departments.status.
/// </summary>
public static class DepartmentStatuses
{
    public const string Active = Statuses.MasterData.Active;
    public const string Inactive = Statuses.MasterData.Inactive;
    public const string Archived = Statuses.MasterData.Archived;
}
