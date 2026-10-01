using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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

    public JwtTokenResult CreateToken(User user, IEnumerable<string> roleCodes, Guid? employeeId = null, Guid? departmentId = null)
    {
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email),
            new("name", user.DisplayName),
        };

        if (user.OrganizationId.HasValue)
        {
            claims.Add(new Claim("org", user.OrganizationId.Value.ToString()));
        }

        if (employeeId.HasValue)
        {
            claims.Add(new Claim("emp_id", employeeId.Value.ToString()));
        }

        if (departmentId.HasValue)
        {
            claims.Add(new Claim("dept_id", departmentId.Value.ToString()));
        }

        foreach (var roleCode in roleCodes)
        {
            claims.Add(new Claim("role", roleCode));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_settings.ExpiresInMinutes);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        var refreshToken = GenerateRefreshToken();
        var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(_settings.RefreshTokenExpiresInDays);

        return new JwtTokenResult
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            RefreshTokenExpiresAt = refreshTokenExpiresAt,
        };
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public string HashRefreshToken(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
