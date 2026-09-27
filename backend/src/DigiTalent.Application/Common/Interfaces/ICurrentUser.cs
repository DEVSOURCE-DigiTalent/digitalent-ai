namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Người đang gọi API (đọc từ token FE gửi lên).
/// Inject vào use case khi cần biết "ai đang làm", VD: lấy tổ chức của user để tạo dữ liệu.
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    Guid? OrganizationId { get; }
    List<string> Roles { get; }
}
