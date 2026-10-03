namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Người đang gọi API (đọc từ token FE gửi lên).
/// Inject vào use case khi cần biết "ai đang làm", VD: chỉ cho manager xem phòng ban của mình.
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    Guid? OrganizationId { get; }
    Guid? EmployeeId { get; }
    Guid? DepartmentId { get; }
    string? IpAddress { get; }
    List<string> Roles { get; }

    bool IsInRole(string roleCode);
    bool IsAdmin { get; }
    bool IsDepartmentManager { get; }

    /// <summary>
    /// Tổ chức của người gọi; không có → ForbiddenException (403).
    /// </summary>
    Guid GetRequiredOrganizationId();

    /// <summary>
    /// Phòng ban của người gọi; không có → ForbiddenException (403).
    /// Dùng cho Department Manager hoặc usecase giới hạn phạm vi phòng ban.
    /// </summary>
    Guid GetRequiredDepartmentId();
}
