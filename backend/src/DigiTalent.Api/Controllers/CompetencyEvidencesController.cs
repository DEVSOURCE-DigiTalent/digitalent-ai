using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Bằng chứng năng lực (competency_evidences). Sprint 3: ghi nhận thủ công của HR.</summary>
[ApiController]
[Route("api/v1/competency-evidences")]
public class CompetencyEvidencesController : ControllerBase
{
    // POST api/v1/competency-evidences/manual
    [HttpPost("manual")]
    [HasPermission(Permissions.Competency.EvidenceCreateManual)]
    public async Task<ActionResult<ApiResponse<CreateManualEvidenceUseCaseOutput>>> CreateManual(
        [FromBody] CreateManualEvidenceUseCaseInput input,
        [FromServices] IUseCase<CreateManualEvidenceUseCaseInput, CreateManualEvidenceUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateManualEvidenceUseCaseOutput>.Ok(result, "Competency level confirmed."));
    }
}
