using DigiTalent.Api.Authorization;
using DigiTalent.Application.Auth.DTOs;
using DigiTalent.Application.Auth.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

/// <summary>
/// Authentication endpoints: login, refresh token, logout, change password, and current user.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// POST /api/v1/auth/login
    /// Authenticate user and return access/refresh tokens.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();
        var result = await _authService.LoginAsync(request, ipAddress, userAgent);
        return Ok(ApiResponse<LoginResponse>.Ok(result, "Login successful"));
    }

    /// <summary>
    /// POST /api/v1/auth/refresh-token
    /// Issue a new access token when refresh token is valid.
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.RefreshTokenAsync(request, ipAddress);
        return Ok(ApiResponse<TokenResponse>.Ok(result, "Token refreshed successfully"));
    }

    /// <summary>
    /// POST /api/v1/auth/logout
    /// Revoke current refresh token/session.
    /// </summary>
    [HttpPost("logout")]
    [HasPermission(PermissionConstants.AuthLogout)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync();
        return NoContent();
    }

    /// <summary>
    /// GET /api/v1/auth/me
    /// Return current user profile, roles and permissions.
    /// </summary>
    [HttpGet("me")]
    [HasPermission(PermissionConstants.AccountViewOwn)]
    [ProducesResponseType(typeof(ApiResponse<CurrentUserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _authService.GetCurrentUserAsync();
        return Ok(ApiResponse<CurrentUserResponse>.Ok(result));
    }

    /// <summary>
    /// POST /api/v1/auth/change-password
    /// Change own password after verifying current password.
    /// </summary>
    [HttpPost("change-password")]
    [HasPermission(PermissionConstants.AccountChangeOwnPassword)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        await _authService.ChangePasswordAsync(request);
        return NoContent();
    }
}
