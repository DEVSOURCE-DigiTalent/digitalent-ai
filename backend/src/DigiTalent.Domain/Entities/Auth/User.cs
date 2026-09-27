using DigiTalent.Domain.Common;

// Mọi entity dùng chung 1 namespace để chỉ cần 1 dòng using
namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng users. Tài khoản đăng nhập.
/// </summary>
public class User : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OrganizationId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // KHÔNG lưu mật khẩu gốc
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = UserStatuses.Active; // ACTIVE / INACTIVE / LOCKED
    public int FailedLoginCount { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
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
