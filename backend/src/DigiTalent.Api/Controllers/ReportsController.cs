using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Reports;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/intelligence")]
public class ReportsController : ControllerBase
{
    [HttpGet("dashboard")]
    [HasPermission(Permissions.Dashboard.HrCompanyRead, Permissions.Dashboard.DepartmentRead)]
    public async Task<ActionResult<ApiResponse<DashboardDto>>> GetDashboard(
        [FromServices] IUseCase<GetDashboardInput, DashboardDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetDashboardInput());
        return Ok(ApiResponse<DashboardDto>.Ok(result));
    }

    [HttpGet("reports/overview")]
    [HasPermission(Permissions.Dashboard.HrCompanyRead, Permissions.Dashboard.ReportExport)]
    public async Task<ActionResult<ApiResponse<ReportsOverviewDto>>> GetReportsOverview(
        [FromQuery] GetReportsOverviewInput input,
        [FromServices] IUseCase<GetReportsOverviewInput, ReportsOverviewDto> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ReportsOverviewDto>.Ok(result));
    }
}
