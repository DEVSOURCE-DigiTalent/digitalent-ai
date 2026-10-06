using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Assessments;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/assessments")]
public class AssessmentsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<AssessmentDto>>> GetAssessment(
        Guid id,
        [FromServices] IUseCase<GetAssessmentByIdInput, AssessmentDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetAssessmentByIdInput { Id = id });
        return Ok(ApiResponse<AssessmentDto>.Ok(result));
    }

    [HttpPost("{id:guid}/attempt")]
    [HasPermission(Permissions.Assessment.AttemptStart)]
    public async Task<ActionResult<ApiResponse<AttemptResultDto>>> SubmitAttempt(
        Guid id,
        [FromBody] SubmitAttemptInput input,
        [FromServices] IUseCase<SubmitAttemptInput, AttemptResultDto> useCase)
    {
        input.AssessmentId = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<AttemptResultDto>.Ok(result));
    }

    [HttpGet]
    [HasPermission(Permissions.Assessment.AttemptReadResult)]
    public async Task<ActionResult<ApiResponse<GetAssessmentHistoryOutput>>> GetHistory(
        [FromQuery] GetAssessmentHistoryInput input,
        [FromServices] IUseCase<GetAssessmentHistoryInput, GetAssessmentHistoryOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetAssessmentHistoryOutput>.Ok(result));
    }
}
