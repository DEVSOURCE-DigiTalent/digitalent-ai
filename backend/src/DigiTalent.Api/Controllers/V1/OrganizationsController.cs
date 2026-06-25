using DigiTalent.Api.Authorization;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Application.Organization.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class OrganizationsController : ControllerBase
{
    private readonly OrganizationService _orgService;

    public OrganizationsController(OrganizationService orgService) => _orgService = orgService;

    [HttpGet("departments")]
    [HasPermission(PermissionConstants.DepartmentRead)]
    public async Task<IActionResult> SearchDepartments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<DepartmentResponse>>.Ok(await _orgService.SearchDepartmentsAsync(request)));

    [HttpPost("departments")]
    [HasPermission(PermissionConstants.DepartmentCreateUpdate)]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
        => Ok(ApiResponse<DepartmentResponse>.Ok(await _orgService.CreateDepartmentAsync(request), "Department created"));

    [HttpPut("departments/{departmentId:guid}")]
    [HasPermission(PermissionConstants.DepartmentCreateUpdate)]
    public async Task<IActionResult> UpdateDepartment(Guid departmentId, [FromBody] UpdateDepartmentRequest request)
        => Ok(ApiResponse<DepartmentResponse>.Ok(await _orgService.UpdateDepartmentAsync(departmentId, request)));

    [HttpPatch("departments/{departmentId:guid}/status")]
    [HasPermission(PermissionConstants.DepartmentCreateUpdate)]
    public async Task<IActionResult> ChangeDepartmentStatus(Guid departmentId, [FromBody] StatusChangeRequest request)
    {
        await _orgService.ChangeDepartmentStatusAsync(departmentId, request);
        return Ok(ApiResponse.Ok(null, "Status updated"));
    }

    [HttpGet("job-positions")]
    [HasPermission(PermissionConstants.JobPositionRead)]
    public async Task<IActionResult> SearchJobPositions([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<JobPositionResponse>>.Ok(await _orgService.SearchJobPositionsAsync(request)));

    [HttpPost("job-positions")]
    [HasPermission(PermissionConstants.JobPositionCreateUpdate)]
    public async Task<IActionResult> CreateJobPosition([FromBody] CreateJobPositionRequest request)
        => Ok(ApiResponse<JobPositionResponse>.Ok(await _orgService.CreateJobPositionAsync(request), "Position created"));

    [HttpPut("job-positions/{positionId:guid}")]
    [HasPermission(PermissionConstants.JobPositionCreateUpdate)]
    public async Task<IActionResult> UpdateJobPosition(Guid positionId, [FromBody] UpdateJobPositionRequest request)
        => Ok(ApiResponse<JobPositionResponse>.Ok(await _orgService.UpdateJobPositionAsync(positionId, request)));

    [HttpGet("employees")]
    [HasPermission(PermissionConstants.EmployeeRead)]
    public async Task<IActionResult> SearchEmployees([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<EmployeeSummaryResponse>>.Ok(await _orgService.SearchEmployeesAsync(request)));

    [HttpPost("employees")]
    [HasPermission(PermissionConstants.EmployeeCreateUpdate)]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
        => Ok(ApiResponse<EmployeeDetailResponse>.Ok(await _orgService.CreateEmployeeAsync(request), "Employee created"));

    [HttpGet("employees/{employeeId:guid}")]
    [HasPermission(PermissionConstants.EmployeeRead)]
    public async Task<IActionResult> GetEmployee(Guid employeeId)
        => Ok(ApiResponse<EmployeeDetailResponse>.Ok(await _orgService.GetEmployeeAsync(employeeId)));

    [HttpPut("employees/{employeeId:guid}")]
    [HasPermission(PermissionConstants.EmployeeCreateUpdate)]
    public async Task<IActionResult> UpdateEmployee(Guid employeeId, [FromBody] UpdateEmployeeRequest request)
        => Ok(ApiResponse<EmployeeDetailResponse>.Ok(await _orgService.UpdateEmployeeAsync(employeeId, request)));

    [HttpPatch("employees/{employeeId:guid}/assignment")]
    [HasPermission(PermissionConstants.EmployeeTransfer)]
    public async Task<IActionResult> TransferEmployee(Guid employeeId, [FromBody] EmployeeAssignmentRequest request)
    {
        await _orgService.TransferEmployeeAsync(employeeId, request);
        return Ok(ApiResponse.Ok(null, "Employee transferred"));
    }
}
