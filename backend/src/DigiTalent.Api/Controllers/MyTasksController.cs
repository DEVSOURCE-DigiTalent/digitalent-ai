using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Tasks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/me")]
public class MyTasksController : ControllerBase
{
    [HttpGet("tasks")]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<GetMyTasksOutput>>> GetMyTasks(
        [FromServices] IUseCase<GetMyTasksInput, GetMyTasksOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyTasksInput());
        return Ok(ApiResponse<GetMyTasksOutput>.Ok(result));
    }

    [HttpGet("evidence")]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<GetMyEvidenceOutput>>> GetMyEvidence(
        [FromServices] IUseCase<GetMyEvidenceInput, GetMyEvidenceOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyEvidenceInput());
        return Ok(ApiResponse<GetMyEvidenceOutput>.Ok(result));
    }
}
