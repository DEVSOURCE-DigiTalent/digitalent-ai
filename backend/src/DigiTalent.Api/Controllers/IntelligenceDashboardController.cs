using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.Dashboard;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Capability dashboard (OW-01, LCA-01). Data is limited to the caller's EmployeeScope.
/// </summary>
[ApiController]
[Route("api/v1/intelligence/dashboard")]
public class IntelligenceDashboardController : ControllerBase
{
    // GET api/v1/intelligence/dashboard
    [HttpGet]
    [HasPermission(Permissions.Dashboard.HrCompanyRead)]
    public async Task<ActionResult<ApiResponse<GetCapabilityDashboardUseCaseOutput>>> Get(
        [FromServices] IUseCase<GetCapabilityDashboardUseCaseInput, GetCapabilityDashboardUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetCapabilityDashboardUseCaseInput());
        return Ok(ApiResponse<GetCapabilityDashboardUseCaseOutput>.Ok(result));
    }
}
