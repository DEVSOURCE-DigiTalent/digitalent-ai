using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Khung năng lực số of the organization (OW-05): 6 domains × 3 levels of courses, the courses the organization owns, and
/// the required level per domain of the 5 standard positions (shared by every department), written into the position standard.
/// </summary>
[ApiController]
[Route("api/v1/capability-ceilings")]
public class CapabilityCeilingsController : ControllerBase
{
    // GET api/v1/capability-ceilings
    [HttpGet]
    [HasPermission(Permissions.PositionRequirement.Read)]
    public async Task<ActionResult<ApiResponse<GetCapabilityCeilingsUseCaseOutput>>> Get(
        [FromServices] IUseCase<GetCapabilityCeilingsUseCaseInput, GetCapabilityCeilingsUseCaseOutput> useCase,
        [FromServices] DigiTalent.Infrastructure.Persistence.AppDbContext db,
        [FromServices] DigiTalent.Application.Common.Interfaces.ICurrentUser currentUser)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId.HasValue)
        {
            await DigiTalent.Infrastructure.Persistence.Seed.SkillGapSeeder.EnsureOrganizationFrameworkAndCoursesAsync(db, orgId.Value, currentUser.UserId);
        }
        var result = await useCase.ExecuteAsync(new GetCapabilityCeilingsUseCaseInput());
        return Ok(ApiResponse<GetCapabilityCeilingsUseCaseOutput>.Ok(result));
    }

    // PUT api/v1/capability-ceilings/organization — body { ceilings: [{ categoryId, level }] }
    [HttpPut("organization")]
    [HasPermission(Permissions.PositionRequirement.Manage)]
    public async Task<ActionResult<ApiResponse<UpdateOrganizationCeilingsUseCaseOutput>>> UpdateOrganization(
        [FromBody] UpdateOrganizationCeilingsUseCaseInput input,
        [FromServices] IUseCase<UpdateOrganizationCeilingsUseCaseInput, UpdateOrganizationCeilingsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateOrganizationCeilingsUseCaseOutput>.Ok(result, "Organization ceiling saved."));
    }

    // PUT api/v1/capability-ceilings/positions/{code} — code CEO | HR | MARKETING | SALES_CRM | ACCOUNTANT,
    // body { inherit?, ceilings: [{ categoryId, level }] }
    [HttpPut("positions/{code}")]
    [HasPermission(Permissions.PositionRequirement.Manage)]
    public async Task<ActionResult<ApiResponse<UpdatePositionCeilingsUseCaseOutput>>> UpdatePosition(
        string code,
        [FromBody] UpdatePositionCeilingsUseCaseInput input,
        [FromServices] IUseCase<UpdatePositionCeilingsUseCaseInput, UpdatePositionCeilingsUseCaseOutput> useCase)
    {
        input.Code = code;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdatePositionCeilingsUseCaseOutput>.Ok(result, "Position levels saved."));
    }
}
