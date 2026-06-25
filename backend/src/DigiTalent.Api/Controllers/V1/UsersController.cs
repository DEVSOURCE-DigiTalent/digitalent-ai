using DigiTalent.Api.Authorization;
using DigiTalent.Application.Users.DTOs;
using DigiTalent.Application.Users.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("users")]
    [HasPermission(PermissionConstants.UserRead)]
    public async Task<IActionResult> SearchUsers([FromQuery] PaginationRequest request)
    {
        var result = await _userService.SearchAsync(request);
        return Ok(ApiResponse<PagedList<UserSummaryResponse>>.Ok(result));
    }

    [HttpPost("users")]
    [HasPermission(PermissionConstants.UserCreate)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateAsync(request);
        return CreatedAtAction(nameof(GetUser), new { userId = result.Id },
            ApiResponse<UserDetailResponse>.Ok(result, "User created successfully"));
    }

    [HttpGet("users/{userId:guid}")]
    [HasPermission(PermissionConstants.UserRead)]
    public async Task<IActionResult> GetUser(Guid userId)
    {
        var result = await _userService.GetByIdAsync(userId);
        return Ok(ApiResponse<UserDetailResponse>.Ok(result));
    }

    [HttpPut("users/{userId:guid}")]
    [HasPermission(PermissionConstants.UserUpdate)]
    public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateUserRequest request)
    {
        var result = await _userService.UpdateAsync(userId, request);
        return Ok(ApiResponse<UserDetailResponse>.Ok(result, "User updated successfully"));
    }

    [HttpPost("users/{userId:guid}/roles")]
    [HasPermission(PermissionConstants.RoleAssignBusiness)]
    public async Task<IActionResult> AssignRoles(Guid userId, [FromBody] AssignUserRolesRequest request)
    {
        await _userService.AssignRolesAsync(userId, request);
        return Ok(ApiResponse.Ok(null, "Roles assigned successfully"));
    }

    [HttpPost("users/{userId:guid}/lock")]
    [HasPermission(PermissionConstants.UserLockUnlock)]
    public async Task<IActionResult> LockUser(Guid userId, [FromBody] LockUserRequest request)
    {
        await _userService.LockAsync(userId, request);
        return Ok(ApiResponse.Ok(null, "User locked successfully"));
    }

    [HttpPost("users/{userId:guid}/unlock")]
    [HasPermission(PermissionConstants.UserLockUnlock)]
    public async Task<IActionResult> UnlockUser(Guid userId)
    {
        await _userService.UnlockAsync(userId);
        return Ok(ApiResponse.Ok(null, "User unlocked successfully"));
    }

    // ── Roles ──

    [HttpGet("roles")]
    [HasPermission(PermissionConstants.RoleRead)]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _userService.GetRolesAsync();
        return Ok(ApiResponse<List<RoleResponse>>.Ok(result));
    }

    [HttpGet("permissions")]
    [HasPermission(PermissionConstants.PermissionRead)]
    public async Task<IActionResult> GetPermissions()
    {
        var result = await _userService.GetPermissionsAsync();
        return Ok(ApiResponse<List<PermissionResponse>>.Ok(result));
    }
}
