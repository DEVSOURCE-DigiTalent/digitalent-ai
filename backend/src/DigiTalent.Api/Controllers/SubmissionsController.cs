using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Tasks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/submissions")]
public class SubmissionsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Task.Evaluate, Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<SubmissionDetailDto>>> GetSubmissionDetail(
        Guid id,
        [FromServices] IUseCase<GetSubmissionDetailInput, SubmissionDetailDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetSubmissionDetailInput { Id = id });
        return Ok(ApiResponse<SubmissionDetailDto>.Ok(result));
    }

    [HttpPost("{id:guid}/evaluate")]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<TaskSubmissionDto>>> EvaluateSubmission(
        Guid id,
        [FromBody] EvaluateSubmissionInput input,
        [FromServices] IUseCase<EvaluateSubmissionInput, TaskSubmissionDto> useCase)
    {
        input.SubmissionId = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<TaskSubmissionDto>.Ok(result));
    }
}
