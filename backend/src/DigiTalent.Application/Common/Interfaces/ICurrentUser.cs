namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Người đang gọi API (đọc từ token FE gửi lên).
/// Inject vào use case khi cần biết "ai đang làm", VD: chỉ cho manager xem phòng ban của mình.
/// Kiểm tra quyền dùng IPermissionService (quyền đọc từ database).
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    Guid? OrganizationId { get; }
    List<string> Roles { get; }

    /// <summary>
    /// Tổ chức của người gọi; không có → ForbiddenException (403).
    /// Dùng ở ĐẦU mọi use case đọc/ghi dữ liệu theo tổ chức.
    /// </summary>
    Guid GetRequiredOrganizationId();
}
