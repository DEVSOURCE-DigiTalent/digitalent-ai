using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.OrganizationOverview;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// The caller's organization.
/// </summary>
[ApiController]
[Route("api/v1/organization")]
public class OrganizationController : ControllerBase
{
    // GET api/v1/organization/overview
    [HttpGet("overview")]
    [HasPermission(Permissions.Dashboard.HrCompanyRead)]
    public async Task<ActionResult<ApiResponse<GetOrganizationOverviewUseCaseOutput>>> GetOverview(
        [FromServices] IUseCase<GetOrganizationOverviewUseCaseInput, GetOrganizationOverviewUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetOrganizationOverviewUseCaseInput());
        return Ok(ApiResponse<GetOrganizationOverviewUseCaseOutput>.Ok(result));
    }
}
