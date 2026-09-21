namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// Cấu hình token, đọc từ mục "Jwt" trong appsettings.json.
/// </summary>
public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SigningKey { get; set; } = string.Empty; // khóa bí mật để ký token, tối thiểu 32 ký tự
    public int ExpiresInMinutes { get; set; } = 480;
}
