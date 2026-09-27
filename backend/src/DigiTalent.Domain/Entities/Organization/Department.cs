using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng departments. Phòng ban. Mã (code) không trùng trong cùng 1 tổ chức.
/// </summary>
public class Department : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid? ParentDepartmentId { get; set; }   // phòng ban cha (nếu có cấp bậc)
    public Guid? ManagerEmployeeId { get; set; }    // trưởng phòng
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = DepartmentStatuses.Active;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>
/// Các giá trị dùng cho cột departments.status.
/// </summary>
public static class DepartmentStatuses
{
    public const string Active = "ACTIVE";
    public const string Archived = "ARCHIVED";
}
