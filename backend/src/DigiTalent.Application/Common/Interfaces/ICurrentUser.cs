namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Người đang gọi API (đọc từ token FE gửi lên).
/// Inject vào use case khi cần biết "ai đang làm", VD: chỉ cho manager xem phòng ban của mình.
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    List<string> Roles { get; }
    bool HasPermission(string permission);
}
