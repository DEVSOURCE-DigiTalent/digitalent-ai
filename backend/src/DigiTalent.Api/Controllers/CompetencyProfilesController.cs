using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Confirmed competency levels of the workforce (OW-19, MG-04). Scope: HR/Admin whole organization, Department Manager
/// own department.
/// </summary>
[ApiController]
[Route("api/v1/competency-profiles")]
public class CompetencyProfilesController : ControllerBase
{
    // GET api/v1/competency-profiles/matrix?departmentId=&jobPositionId=&jobGrade=&categoryId=&search=
    [HttpGet("matrix")]
    [HasPermission(Permissions.Competency.ProfileRead)]
    public async Task<ActionResult<ApiResponse<GetCompetencyMatrixUseCaseOutput>>> GetMatrix(
        [FromQuery] GetCompetencyMatrixUseCaseInput input,
        [FromServices] IUseCase<GetCompetencyMatrixUseCaseInput, GetCompetencyMatrixUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCompetencyMatrixUseCaseOutput>.Ok(result));
    }
}
