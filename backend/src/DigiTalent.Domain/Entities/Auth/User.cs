using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

// Mọi entity dùng chung 1 namespace để chỉ cần 1 dòng using
namespace DigiTalent.Domain.Entities;

/// <summary>
/// Tài khoản đăng nhập (bảng users). Hồ sơ nhân sự nằm ở Employee (employees.user_id).
/// </summary>
public class User : BaseEntity
{
    public Guid? OrganizationId { get; set; }
    public string Email { get; set; } = string.Empty;        // luôn lưu chữ thường
    public string PasswordHash { get; set; } = string.Empty; // KHÔNG lưu mật khẩu gốc
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = Statuses.User.Active;
    public int FailedLoginCount { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }          // LOCKED + null = admin khóa tay
    public DateTimeOffset? LastLoginAt { get; set; }
    public DateTimeOffset? EmailVerifiedAt { get; set; }
    public DateTimeOffset? TrialUsedAt { get; set; }

    /// <summary>
    /// Concurrency token = cột hệ thống xmin của PostgreSQL (không tạo cột mới).
    /// Chặn 2 request đăng nhập song song ghi đè bộ đếm sai mật khẩu của nhau.
    /// </summary>
    public uint Version { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    /// <summary>
    /// Đang bị khóa tại thời điểm now? Khóa tạm đã hết hạn thì coi như không khóa.
    /// </summary>
    public bool IsLockedAt(DateTimeOffset now) =>
        Status == Statuses.User.Locked && (LockedUntil == null || LockedUntil > now);

    // Sai mật khẩu: KHÔNG xử lý ở đây mà bằng câu UPDATE nguyên tử trong
    // LoginUseCase.RecordFailedLoginAsync (an toàn khi nhiều request song song).

    /// <summary>
    /// Đăng nhập đúng: xóa bộ đếm, mở khóa tạm đã hết hạn, ghi thời điểm đăng nhập.
    /// </summary>
    public void RegisterSuccessfulLogin(DateTimeOffset now)
    {
        FailedLoginCount = 0;
        if (Status == Statuses.User.Locked)
        {
            Status = Statuses.User.Active;
            LockedUntil = null;
        }
        LastLoginAt = now;
    }
}

/// <summary>
/// Các giá trị hợp lệ của cột users.status (DB có CHECK constraint ck_users_status).
/// </summary>
public static class UserStatuses
{
    public const string Active = "ACTIVE";
    public const string Inactive = "INACTIVE";
    public const string Locked = "LOCKED";
}
