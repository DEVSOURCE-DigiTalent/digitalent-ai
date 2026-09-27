namespace DigiTalent.Domain.Constants;

/// <summary>
/// Chính sách khóa tài khoản (doc 15, MSG02): sai mật khẩu 5 lần liên tiếp → khóa 15 phút.
/// </summary>
public static class LoginPolicy
{
    public const int MaxFailedAttempts = 5;
    public const int LockoutMinutes = 15;
}
