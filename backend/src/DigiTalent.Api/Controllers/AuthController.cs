using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Auth;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    // POST api/v1/auth/login — không gắn [HasPermission] vì chưa đăng nhập thì mới cần login
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginUseCaseOutput>>> Login(
        [FromBody] LoginUseCaseInput input,
        [FromServices] IUseCase<LoginUseCaseInput, LoginUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<LoginUseCaseOutput>.Ok(result, "Login successful."));
    }

    // GET api/v1/auth/me — thông tin user đang đăng nhập + roles + permissions
    [HttpGet("me")]
    [HasPermission(Permissions.Account.ViewOwn)]
    public async Task<ActionResult<ApiResponse<GetCurrentUserUseCaseOutput>>> GetCurrentUser(
        [FromServices] IUseCase<GetCurrentUserUseCaseInput, GetCurrentUserUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetCurrentUserUseCaseInput());
        return Ok(ApiResponse<GetCurrentUserUseCaseOutput>.Ok(result));
    }

    // POST api/v1/auth/logout
    // Token không lưu ở server nên không có gì để xóa: FE tự xóa token trong localStorage.
    // Giữ API này vì FE (Topbar) đang gọi tới.
    [HttpPost("logout")]
    public ActionResult<ApiResponse<object?>> Logout()
    {
        return Ok(ApiResponse<object?>.Ok(null, "Logged out."));
    }
}
