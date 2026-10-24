using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Account;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>SHR-01 / SHR-02: hồ sơ, đổi mật khẩu và phiên đăng nhập của chính người dùng (mọi vai trò).</summary>
[ApiController]
[Route("api/v1/account")]
public class AccountController : ControllerBase
{
    [HttpGet("profile")]
    [HasPermission(Permissions.Account.ViewOwn)]
    public async Task<ActionResult<ApiResponse<AccountProfileOutput>>> GetProfile(
        [FromServices] IUseCase<GetAccountProfileInput, AccountProfileOutput> useCase)
        => Ok(ApiResponse<AccountProfileOutput>.Ok(await useCase.ExecuteAsync(new GetAccountProfileInput())));

    [HttpPut("profile")]
    [HasPermission(Permissions.Account.UpdateOwnProfile)]
    public async Task<ActionResult<ApiResponse<AccountProfileOutput>>> UpdateProfile(
        [FromBody] UpdateAccountProfileInput input,
        [FromServices] IUseCase<UpdateAccountProfileInput, AccountProfileOutput> useCase)
        => Ok(ApiResponse<AccountProfileOutput>.Ok(await useCase.ExecuteAsync(input)));

    [HttpPost("change-password")]
    [HasPermission(Permissions.Account.ChangeOwnPassword)]
    public async Task<ActionResult<ApiResponse<object?>>> ChangePassword(
        [FromBody] ChangePasswordInput input,
        [FromServices] IUseCase<ChangePasswordInput, bool> useCase)
    {
        await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<object?>.Ok(null, "Đã đổi mật khẩu."));
    }

    [HttpGet("login-history")]
    [HasPermission(Permissions.Account.ViewOwn)]
    public async Task<ActionResult<ApiResponse<List<LoginHistoryItem>>>> GetLoginHistory(
        [FromServices] IUseCase<GetLoginHistoryInput, List<LoginHistoryItem>> useCase)
        => Ok(ApiResponse<List<LoginHistoryItem>>.Ok(await useCase.ExecuteAsync(new GetLoginHistoryInput())));
}
