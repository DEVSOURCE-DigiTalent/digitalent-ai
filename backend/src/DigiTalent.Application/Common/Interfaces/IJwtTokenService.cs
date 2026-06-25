using System.Security.Claims;
using DigiTalent.Domain.Entities.Auth;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Service for generating and validating JWT access and refresh tokens.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generates an access token for the specified user with roles and permissions.
    /// </summary>
    string GenerateAccessToken(User user, List<string> roles, List<string> permissions, Guid? employeeId = null);

    /// <summary>
    /// Generates a refresh token entity (the token string itself is cryptographically random).
    /// </summary>
    (RefreshToken token, string plainToken) GenerateRefreshToken(Guid userId, string? ipAddress = null, string? userAgent = null);

    /// <summary>
    /// Gets the claims principal from an expired/valid access token (for refresh flow).
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string accessToken);

    /// <summary>
    /// Creates a SHA-256 hash of a token string for secure storage.
    /// </summary>
    string HashToken(string token);
}
