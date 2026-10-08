using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Workforce;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Workforce of the organization (OW-03, OW-10, OW-19, OW-20). Scope: HR/Admin whole organization, Department Manager
/// own department, others themselves (EmployeeScope; out of scope → 404).
/// </summary>
[ApiController]
[Route("api/v1/workforce")]
public class WorkforceController : ControllerBase
{
    // GET api/v1/workforce?pageIndex=1&pageSize=20&search=&departmentId=&jobPositionId=&status=&gap=HIGH&learning=OVERDUE
    [HttpGet]
    [HasPermission(Permissions.Employee.Read)]
    public async Task<ActionResult<ApiResponse<GetWorkforceUseCaseOutput>>> GetList(
        [FromQuery] GetWorkforceUseCaseInput input,
        [FromServices] IUseCase<GetWorkforceUseCaseInput, GetWorkforceUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetWorkforceUseCaseOutput>.Ok(result));
    }

    // GET api/v1/workforce/{employeeId}
    [HttpGet("{employeeId:guid}")]
    [HasPermission(Permissions.Competency.ProfileRead)]
    public async Task<ActionResult<ApiResponse<GetEmployeeCapabilityUseCaseOutput>>> GetById(
        Guid employeeId,
        [FromServices] IUseCase<GetEmployeeCapabilityUseCaseInput, GetEmployeeCapabilityUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetEmployeeCapabilityUseCaseInput { EmployeeId = employeeId });
        return Ok(ApiResponse<GetEmployeeCapabilityUseCaseOutput>.Ok(result));
    }
}
