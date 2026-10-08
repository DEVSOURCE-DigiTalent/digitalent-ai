using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/position-requirements")]
public class PositionRequirementsController : ControllerBase
{
    // GET api/v1/position-requirements?positionId={positionId}&versionNo=1
    [HttpGet]
    [HasPermission(Permissions.PositionRequirement.Read)]
    public async Task<ActionResult<ApiResponse<GetPositionRequirementsUseCaseOutput>>> GetByPosition(
        [FromQuery] GetPositionRequirementsUseCaseInput input,
        [FromServices] IUseCase<GetPositionRequirementsUseCaseInput, GetPositionRequirementsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPositionRequirementsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/position-requirements/summaries
    [HttpGet("summaries")]
    [HasPermission(Permissions.PositionRequirement.Read)]
    public async Task<ActionResult<ApiResponse<GetPositionRequirementSummariesUseCaseOutput>>> GetSummaries(
        [FromServices] IUseCase<GetPositionRequirementSummariesUseCaseInput, GetPositionRequirementSummariesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPositionRequirementSummariesUseCaseInput());
        return Ok(ApiResponse<GetPositionRequirementSummariesUseCaseOutput>.Ok(result));
    }

    // POST api/v1/position-requirements
    [HttpPost]
    [HasPermission(Permissions.PositionRequirement.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateDraftPositionRequirementSetUseCaseOutput>>> CreateDraft(
        [FromBody] CreateDraftPositionRequirementSetUseCaseInput input,
        [FromServices] IUseCase<CreateDraftPositionRequirementSetUseCaseInput, CreateDraftPositionRequirementSetUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateDraftPositionRequirementSetUseCaseOutput>.Ok(result, "Draft position requirement set created."));
    }

    // PUT api/v1/position-requirements/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.PositionRequirement.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateDraftPositionRequirementSetUseCaseOutput>>> UpdateDraft(
        Guid id,
        [FromBody] UpdateDraftPositionRequirementSetUseCaseInput input,
        [FromServices] IUseCase<UpdateDraftPositionRequirementSetUseCaseInput, UpdateDraftPositionRequirementSetUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateDraftPositionRequirementSetUseCaseOutput>.Ok(result, "Draft position requirement set updated."));
    }

    // POST api/v1/position-requirements/{id}/activate
    [HttpPost("{id:guid}/activate")]
    [HasPermission(Permissions.PositionRequirement.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<ActivatePositionRequirementSetUseCaseOutput>>> Activate(
        Guid id,
        [FromServices] IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput> useCase)
    {
        var input = new ActivatePositionRequirementSetUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ActivatePositionRequirementSetUseCaseOutput>.Ok(result, "Position requirement set activated successfully."));
    }
}
