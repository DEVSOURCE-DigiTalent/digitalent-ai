using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Ceiling matrix of the organization (OW-05 "Lý thuyết trần nhà"): Digital AI ceiling (6 domains × 3 levels),
/// organization ceiling and optional department ceilings, with department ≤ organization ≤ Digital AI per domain.
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

    // PUT api/v1/capability-ceilings/departments/{departmentId} — body { inherit?, ceilings: [{ categoryId, level }] }
    [HttpPut("departments/{departmentId:guid}")]
    [HasPermission(Permissions.PositionRequirement.Manage)]
    public async Task<ActionResult<ApiResponse<UpdateDepartmentCeilingsUseCaseOutput>>> UpdateDepartment(
        Guid departmentId,
        [FromBody] UpdateDepartmentCeilingsUseCaseInput input,
        [FromServices] IUseCase<UpdateDepartmentCeilingsUseCaseInput, UpdateDepartmentCeilingsUseCaseOutput> useCase)
    {
        input.DepartmentId = departmentId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateDepartmentCeilingsUseCaseOutput>.Ok(result, "Department ceiling saved."));
    }
}
