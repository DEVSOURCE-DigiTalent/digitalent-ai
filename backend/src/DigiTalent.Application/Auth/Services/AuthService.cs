using DigiTalent.Application.Auth.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Errors;
using DigiTalent.Shared.Security;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Auth.Services;

/// <summary>
/// Handles authentication operations: login, refresh token, logout, password change, and current user retrieval.
/// </summary>
public class AuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserService _currentUser;

    public AuthService(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        ICurrentUserService currentUser)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Authenticates user with email and password. Returns JWT tokens on success.
    /// </summary>
    public async Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim());

        if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException(ErrorCodes.InvalidCredentials);

        // Check account status
        if (user.Status == Domain.Enums.UserStatus.Locked)
            throw new UnauthorizedAccessException(ErrorCodes.AccountLocked);

        if (user.Status == Domain.Enums.UserStatus.Disabled)
            throw new UnauthorizedAccessException("Account is disabled.");

        // Reset failed login count on successful login
        user.FailedLoginCount = 0;
        user.LastLoginAt = DateTimeOffset.UtcNow;

        // Extract roles and permissions
        var roles = user.UserRoles.Select(ur => ur.Role.Code).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        // Get employee ID if linked
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == user.Email);
        var employeeId = employee?.Id;

        // Get managed department IDs for department-scoped access
        List<Guid> managedDeptIds = new();
        if (employeeId.HasValue)
        {
            managedDeptIds = await _context.Departments
                .Where(d => d.ManagerEmployeeId == employeeId.Value)
                .Select(d => d.Id)
                .ToListAsync();
        }

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles, permissions, employeeId, managedDeptIds);
        var (refreshTokenEntity, plainRefreshToken) = _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress, userAgent);

        // Store refresh token
        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(default);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = plainRefreshToken,
            ExpiresIn = AppConstants.AccessTokenExpirationMinutes * 60,
            User = MapToCurrentUser(user, roles, permissions, employeeId),
        };
    }

    /// <summary>
    /// Refreshes the access token using a valid refresh token.
    /// </summary>
    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress = null)
    {
        var tokenHash = _jwtTokenService.HashToken(request.RefreshToken);

        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (storedToken == null)
            throw new UnauthorizedAccessException(ErrorCodes.InvalidToken);

        if (storedToken.RevokedAt.HasValue)
            throw new UnauthorizedAccessException(ErrorCodes.RefreshTokenRevoked);

        if (storedToken.ExpiresAt < DateTimeOffset.UtcNow)
            throw new UnauthorizedAccessException(ErrorCodes.TokenExpired);

        // Revoke old refresh token (token rotation)
        storedToken.RevokedAt = DateTimeOffset.UtcNow;

        var user = storedToken.User;

        // Extract roles and permissions
        var roles = user.UserRoles.Select(ur => ur.Role.Code).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        // Get employee ID if linked
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == user.Email);
        var employeeId = employee?.Id;

        // Get managed department IDs
        List<Guid> managedDeptIds = new();
        if (employeeId.HasValue)
        {
            managedDeptIds = await _context.Departments
                .Where(d => d.ManagerEmployeeId == employeeId.Value)
                .Select(d => d.Id)
                .ToListAsync();
        }

        // Generate new tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles, permissions, employeeId, managedDeptIds);
        var (newRefreshTokenEntity, plainRefreshToken) = _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);

        // Link new refresh token to the revoked one
        newRefreshTokenEntity.ReplacedByTokenId = storedToken.Id;

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        await _context.SaveChangesAsync(default);

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = plainRefreshToken,
            ExpiresIn = AppConstants.AccessTokenExpirationMinutes * 60,
        };
    }

    /// <summary>
    /// Revokes the current user's refresh tokens (logout).
    /// </summary>
    public async Task LogoutAsync()
    {
        if (!_currentUser.UserId.HasValue)
            return;

        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == _currentUser.UserId.Value && rt.RevokedAt == null)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Changes the current user's password after verifying the current password.
    /// </summary>
    public async Task ChangePasswordAsync(ChangePasswordRequest request)
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var user = await _context.Users.FindAsync(_currentUser.UserId.Value);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (!PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Returns the current user's profile with roles and permissions.
    /// </summary>
    public async Task<CurrentUserResponse> GetCurrentUserAsync()
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        var roles = user.UserRoles.Select(ur => ur.Role.Code).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == user.Email);
        var employeeId = employee?.Id;

        return MapToCurrentUser(user, roles, permissions, employeeId);
    }

    private static CurrentUserResponse MapToCurrentUser(User user, List<string> roles, List<string> permissions, Guid? employeeId)
    {
        return new CurrentUserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            EmployeeId = employeeId,
            Roles = roles,
            Permissions = permissions,
        };
    }
}
