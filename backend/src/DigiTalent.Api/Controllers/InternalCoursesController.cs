using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.InternalCourses;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/internal-courses")]
public class InternalCoursesController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetInternalCoursesOutput>>> GetList(
        [FromQuery] GetInternalCoursesInput input,
        [FromServices] IUseCase<GetInternalCoursesInput, GetInternalCoursesOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetInternalCoursesOutput>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<InternalCourseDto>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetInternalCourseByIdInput, InternalCourseDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetInternalCourseByIdInput { Id = id });
        return Ok(ApiResponse<InternalCourseDto>.Ok(result));
    }

    [HttpPost]
    [HasPermission(Permissions.Learning.Create)]
    public async Task<ActionResult<ApiResponse<InternalCourseDto>>> Create(
        [FromBody] CreateInternalCourseInput input,
        [FromServices] IUseCase<CreateInternalCourseInput, InternalCourseDto> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<InternalCourseDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Learning.Create)]
    public async Task<ActionResult<ApiResponse<InternalCourseDto>>> Update(
        Guid id,
        [FromBody] UpdateInternalCourseInput input,
        [FromServices] IUseCase<UpdateInternalCourseInput, InternalCourseDto> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<InternalCourseDto>.Ok(result));
    }
}
