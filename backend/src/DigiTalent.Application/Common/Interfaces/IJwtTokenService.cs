using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Tạo token sau khi đăng nhập thành công. Code thật nằm ở Infrastructure/Auth/JwtTokenService.cs.
/// </summary>
public interface IJwtTokenService
{
    JwtTokenResult CreateToken(User user);
}

public class JwtTokenResult
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
}
