using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.Analytics;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Skill gap analytics over the latest snapshots (OW-21, OW-40). Scope: HR/Admin whole organization, Department
/// Manager own department.
/// </summary>
[ApiController]
[Route("api/v1/intelligence/analytics")]
public class SkillGapAnalyticsController : ControllerBase
{
    // GET api/v1/intelligence/analytics/overview?groupBy=department&departmentId=&jobPositionId=&jobGrade=
    [HttpGet("overview")]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<GetGapOverviewUseCaseOutput>>> GetOverview(
        [FromQuery] GetGapOverviewUseCaseInput input,
        [FromServices] IUseCase<GetGapOverviewUseCaseInput, GetGapOverviewUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetGapOverviewUseCaseOutput>.Ok(result));
    }

    // GET api/v1/intelligence/analytics/competencies?departmentId=&jobPositionId=&jobGrade=
    [HttpGet("competencies")]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<GetCompetencyGapsUseCaseOutput>>> GetCompetencies(
        [FromQuery] GetCompetencyGapsUseCaseInput input,
        [FromServices] IUseCase<GetCompetencyGapsUseCaseInput, GetCompetencyGapsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCompetencyGapsUseCaseOutput>.Ok(result));
    }
}
