using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Employees;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/employees")]
public class EmployeesController : ControllerBase
{
    // GET api/v1/employees?pageIndex=1&pageSize=20&search=linh&departmentId=...&positionId=...&status=ACTIVE
    [HttpGet]
    [HasPermission(Permissions.Employee.Read)]
    public async Task<ActionResult<ApiResponse<GetPagedEmployeesUseCaseOutput>>> GetPaged(
        [FromQuery] GetPagedEmployeesUseCaseInput input,
        [FromServices] IUseCase<GetPagedEmployeesUseCaseInput, GetPagedEmployeesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedEmployeesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/employees/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Employee.Read)]
    public async Task<ActionResult<ApiResponse<GetEmployeeByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetEmployeeByIdUseCaseInput, GetEmployeeByIdUseCaseOutput> useCase)
    {
        var input = new GetEmployeeByIdUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetEmployeeByIdUseCaseOutput>.Ok(result));
    }

    // POST api/v1/employees
    [HttpPost]
    [HasPermission(Permissions.Employee.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateEmployeeUseCaseOutput>>> Create(
        [FromBody] CreateEmployeeUseCaseInput input,
        [FromServices] IUseCase<CreateEmployeeUseCaseInput, CreateEmployeeUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateEmployeeUseCaseOutput>.Ok(result, "Employee created."));
    }

    // PUT api/v1/employees/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Employee.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateEmployeeUseCaseOutput>>> Update(
        Guid id,
        [FromBody] UpdateEmployeeUseCaseInput input,
        [FromServices] IUseCase<UpdateEmployeeUseCaseInput, UpdateEmployeeUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateEmployeeUseCaseOutput>.Ok(result, "Employee updated."));
    }

    // DELETE api/v1/employees/{id}
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Employee.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<ArchiveEmployeeUseCaseOutput>>> Archive(
        Guid id,
        [FromServices] IUseCase<ArchiveEmployeeUseCaseInput, ArchiveEmployeeUseCaseOutput> useCase)
    {
        var input = new ArchiveEmployeeUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ArchiveEmployeeUseCaseOutput>.Ok(result, "Employee archived."));
    }
}
