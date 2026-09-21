using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Tài khoản đăng nhập.
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // KHÔNG lưu mật khẩu gốc, chỉ lưu bản mã hóa
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Mã role, VD: ["HR_MANAGER"]. 1 user có thể có nhiều role (doc 09).
    /// PostgreSQL lưu thành 1 cột kiểu mảng text[].
    /// </summary>
    public List<string> Roles { get; set; } = new();
}
