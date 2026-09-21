using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// CRUD phòng ban — CONTROLLER MẪU, các module khác viết y hệt.
///
/// Controller chỉ làm 3 việc:
///   1. Nhận dữ liệu từ request (body / query / URL)
///   2. Gọi use case tương ứng (inject bằng [FromServices])
///      (trước đó [HasPermission] đã kiểm tra quyền — MỌI action trừ login đều phải gắn)
///   3. Bọc kết quả vào ApiResponse
///
/// KHÔNG viết logic nghiệp vụ, KHÔNG truy vấn database ở đây.
/// Lỗi (400/404/409) do use case throw → ExceptionHandlingMiddleware tự trả response.
/// </summary>
[ApiController]
[Route("api/v1/departments")]
public class DepartmentsController : ControllerBase
{
    // GET api/v1/departments?pageIndex=1&pageSize=20&search=it&isActive=true
    [HttpGet]
    [HasPermission(Permissions.Department.Read)]
    public async Task<ActionResult<ApiResponse<GetPagedDepartmentsUseCaseOutput>>> GetPaged(
        [FromQuery] GetPagedDepartmentsUseCaseInput input,
        [FromServices] IUseCase<GetPagedDepartmentsUseCaseInput, GetPagedDepartmentsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedDepartmentsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/departments/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Department.Read)]
    public async Task<ActionResult<ApiResponse<GetDepartmentByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetDepartmentByIdUseCaseInput, GetDepartmentByIdUseCaseOutput> useCase)
    {
        var input = new GetDepartmentByIdUseCaseInput { Id = id };

        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetDepartmentByIdUseCaseOutput>.Ok(result));
    }

    // POST api/v1/departments
    [HttpPost]
    [HasPermission(Permissions.Department.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateDepartmentUseCaseOutput>>> Create(
        [FromBody] CreateDepartmentUseCaseInput input,
        [FromServices] IUseCase<CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateDepartmentUseCaseOutput>.Ok(result, "Department created."));
    }

    // PUT api/v1/departments/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Department.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateDepartmentUseCaseOutput>>> Update(
        Guid id,
        [FromBody] UpdateDepartmentUseCaseInput input,
        [FromServices] IUseCase<UpdateDepartmentUseCaseInput, UpdateDepartmentUseCaseOutput> useCase)
    {
        input.Id = id; // Id lấy từ URL

        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateDepartmentUseCaseOutput>.Ok(result, "Department updated."));
    }

    // DELETE api/v1/departments/{id}
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Department.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<DeleteDepartmentUseCaseOutput>>> Delete(
        Guid id,
        [FromServices] IUseCase<DeleteDepartmentUseCaseInput, DeleteDepartmentUseCaseOutput> useCase)
    {
        var input = new DeleteDepartmentUseCaseInput { Id = id };

        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<DeleteDepartmentUseCaseOutput>.Ok(result, "Department deleted."));
    }
}
