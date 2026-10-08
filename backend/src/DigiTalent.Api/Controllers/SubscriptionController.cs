using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Subscription;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/subscription")]
public class SubscriptionController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<SubscriptionDto>>> Get(
        [FromServices] IUseCase<GetSubscriptionInput, SubscriptionDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetSubscriptionInput());
        return Ok(ApiResponse<SubscriptionDto>.Ok(result));
    }

    [HttpGet("usage")]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<UsageDto>>> GetUsage(
        [FromServices] IUseCase<GetUsageInput, UsageDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetUsageInput());
        return Ok(ApiResponse<UsageDto>.Ok(result));
    }

    [HttpPost("cancel")]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<CancelSubscriptionOutput>>> Cancel(
        [FromServices] IUseCase<CancelSubscriptionInput, CancelSubscriptionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CancelSubscriptionInput());
        return Ok(ApiResponse<CancelSubscriptionOutput>.Ok(result));
    }

    [HttpPost("resume")]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<ResumeSubscriptionOutput>>> Resume(
        [FromServices] IUseCase<ResumeSubscriptionInput, ResumeSubscriptionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new ResumeSubscriptionInput());
        return Ok(ApiResponse<ResumeSubscriptionOutput>.Ok(result));
    }
}
