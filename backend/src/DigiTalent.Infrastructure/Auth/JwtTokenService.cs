using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Shared.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// JWT token service implementation.
/// Generates access tokens (short-lived JWT) and refresh tokens (cryptographically random).
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly JwtSettings _settings;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        _settings = new JwtSettings
        {
            SigningKey = configuration["Jwt:SigningKey"] ?? "DefaultSecretKeyThatMustBeChangedInProduction-AtLeast64Characters!",
            Issuer = configuration["Jwt:Issuer"] ?? "DigiTalentAI",
            Audience = configuration["Jwt:Audience"] ?? "DigiTalentAI.Web",
            AccessTokenExpirationMinutes = configuration.GetValue<int?>("Jwt:AccessTokenExpirationMinutes") ?? AppConstants.AccessTokenExpirationMinutes,
            RefreshTokenExpirationDays = configuration.GetValue<int?>("Jwt:RefreshTokenExpirationDays") ?? AppConstants.RefreshTokenExpirationDays,
        };
    }

    public string GenerateAccessToken(User user, List<string> roles, List<string> permissions, Guid? employeeId = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.FullName),
            new("user_id", user.Id.ToString()),
        };

        if (employeeId.HasValue)
            claims.Add(new Claim("employee_id", employeeId.Value.ToString()));

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        // Add permission claims (for quick checks without DB round-trip)
        foreach (var permission in permissions)
            claims.Add(new Claim("permission", permission));

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (RefreshToken token, string plainToken) GenerateRefreshToken(Guid userId, string? ipAddress = null, string? userAgent = null)
    {
        var plainToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            TokenHash = HashToken(plainToken),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_settings.RefreshTokenExpirationDays),
            IpAddress = ipAddress,
            UserAgent = userAgent,
        };

        return (refreshToken, plainToken);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string accessToken)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false, // Allow expired tokens for refresh flow
            ValidateIssuerSigningKey = true,
            ValidIssuer = _settings.Issuer,
            ValidAudience = _settings.Audience,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(accessToken, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    public static string HashTokenStatic(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private class JwtSettings
    {
        public string SigningKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int AccessTokenExpirationMinutes { get; set; } = 15;
        public int RefreshTokenExpirationDays { get; set; } = 7;
    }
}
