using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace DigiTalent.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(JwtSettings settings)
    {
        _settings = settings;
    }

    public JwtTokenResult CreateToken(User user)
    {
        // 1. Thông tin gắn vào token (gọi là "claim"). BE đọc lại các claim này ở mỗi request.
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email),
            new("name", user.FullName),
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim("role", role));
        }

        // 2. Ký token bằng khóa bí mật → FE đọc được nhưng KHÔNG sửa được (sửa là chữ ký sai)
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_settings.ExpiresInMinutes);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new JwtTokenResult
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
        };
    }
}
