namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Mã hóa / kiểm tra mật khẩu. Code thật nằm ở Infrastructure/Auth/PasswordHasher.cs (BCrypt).
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}
