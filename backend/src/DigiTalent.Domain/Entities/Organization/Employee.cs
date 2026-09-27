using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng employees. Hồ sơ nhân viên, nối với tài khoản đăng nhập qua UserId.
/// </summary>
public class Employee : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid? UserId { get; set; }             // tài khoản đăng nhập (1-1, có thể chưa có)
    public Guid DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }   // v2.3: NULL = chưa gắn chức danh
    public Guid? DirectManagerId { get; set; }    // quản lý trực tiếp (cũng là 1 employee)
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = "ACTIVE"; // ACTIVE / INACTIVE / TRANSFERRED / ARCHIVED
    public DateOnly? JoinedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
