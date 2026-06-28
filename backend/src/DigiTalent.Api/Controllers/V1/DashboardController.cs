using DigiTalent.Api.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Dashboard.DTOs;
using DigiTalent.Application.Dashboard.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;

    public DashboardController(DashboardService dashboardService, ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// HR/Company-level dashboard — aggregate organization metrics.
    /// </summary>
    [HttpGet("dashboards/hr/overview")]
    [HasPermission(PermissionConstants.DashboardHrCompanyRead)]
    public async Task<IActionResult> GetHrDashboard()
        => Ok(ApiResponse<HrDashboardResponse>.Ok(
            await _dashboardService.GetHrDashboardAsync()));

    /// <summary>
    /// Department-level dashboard — metrics for managed departments.
    /// </summary>
    [HttpGet("dashboards/manager/overview")]
    [HasPermission(PermissionConstants.DashboardDepartmentRead)]
    public async Task<IActionResult> GetDepartmentDashboard()
        => Ok(ApiResponse<List<DepartmentDashboardResponse>>.Ok(
            await _dashboardService.GetDepartmentDashboardAsync()));

    /// <summary>
    /// Trainer dashboard — owned courses, assessments, pass rates, active learners.
    /// </summary>
    [HttpGet("dashboards/trainer/overview")]
    [HasPermission(PermissionConstants.DashboardTrainerRead)]
    public async Task<IActionResult> GetTrainerDashboard()
        => Ok(ApiResponse<TrainerDashboardResponse>.Ok(
            await _dashboardService.GetTrainerDashboardAsync()));

    /// <summary>
    /// Employee self-service dashboard — own enrollments, progress, certificates, tasks.
    /// </summary>
    [HttpGet("dashboards/employee/overview")]
    [HasPermission(PermissionConstants.DashboardEmployeeRead)]
    public async Task<IActionResult> GetEmployeeDashboard()
        => Ok(ApiResponse<EmployeeDashboardResponse>.Ok(
            await _dashboardService.GetEmployeeDashboardAsync(_currentUser.EmployeeId!.Value)));

    // ═══════════════════════════════════════
    // Dashboard Reports (Phase 7)
    // ═══════════════════════════════════════

    /// <summary>
    /// Competency heatmap — employee vs competency level matrix.
    /// </summary>
    [HttpGet("dashboards/hr/competency-heatmap")]
    [HasPermission(PermissionConstants.DashboardCompetencyHeatmapRead)]
    public async Task<IActionResult> GetCompetencyHeatmap()
        => Ok(ApiResponse<HeatmapResponse>.Ok(
            await _dashboardService.GetCompetencyHeatmapAsync()));

    /// <summary>
    /// Paginated risk list — high/critical risk employees.
    /// </summary>
    [HttpGet("dashboards/hr/risk-list")]
    [HasPermission(PermissionConstants.DashboardHrCompanyRead)]
    public async Task<IActionResult> GetRiskList([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<RiskItemResponse>>.Ok(
            await _dashboardService.GetRiskListAsync(request)));

    /// <summary>
    /// Certificate report — all certificates for reporting.
    /// </summary>
    [HttpGet("reports/certificates")]
    [HasPermission(PermissionConstants.DashboardReportExport)]
    public async Task<IActionResult> GetCertificateReport([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<CertificateReportRow>>.Ok(
            await _dashboardService.GetCertificateReportAsync(request)));

    /// <summary>
    /// Task performance report — aggregated per employee.
    /// </summary>
    [HttpGet("reports/task-performance")]
    [HasPermission(PermissionConstants.DashboardReportExport)]
    public async Task<IActionResult> GetTaskPerformanceReport([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<TaskPerformanceRow>>.Ok(
            await _dashboardService.GetTaskPerformanceReportAsync(request)));
}

