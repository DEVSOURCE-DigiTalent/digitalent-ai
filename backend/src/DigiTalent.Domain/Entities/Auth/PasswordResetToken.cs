using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng password_reset_tokens — tái dùng cho cả 2 mục đích:
///   RESET_PASSWORD : quên mật khẩu → link/token đặt lại mật khẩu
///   VERIFY_EMAIL   : Business Owner vừa đăng ký → OTP 6 số xác minh email
/// Phân biệt qua cột <see cref="Purpose"/>.
/// </summary>
public class PasswordResetToken : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// Mục đích dùng token: xem <see cref="TokenPurpose"/> để lấy hằng số.
    /// Mặc định là RESET_PASSWORD để các token cũ không bị ảnh hưởng.
    /// </summary>
    public string Purpose { get; set; } = TokenPurpose.ResetPassword;

    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User? User { get; set; }
}

/// <summary>Các giá trị hợp lệ của cột password_reset_tokens.purpose.</summary>
public static class TokenPurpose
{
    public const string ResetPassword = "RESET_PASSWORD";
    public const string VerifyEmail = "VERIFY_EMAIL";
}
