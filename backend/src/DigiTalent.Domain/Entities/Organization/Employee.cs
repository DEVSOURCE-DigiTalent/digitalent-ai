using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Hồ sơ nhân sự. Liên kết tối đa 1 tài khoản đăng nhập (UserId).
/// JobPositionId = null → chưa gán vị trí (skill gap trả NOT_ASSIGNED).
/// </summary>
public class Employee : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public Guid? DirectManagerId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = Statuses.Employee.Active;
    public DateOnly? JoinedAt { get; set; }
}
