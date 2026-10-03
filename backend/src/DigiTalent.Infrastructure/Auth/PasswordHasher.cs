using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// Mã hóa mật khẩu bằng BCrypt (1 chiều: không giải mã ngược được, chỉ so sánh được).
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
