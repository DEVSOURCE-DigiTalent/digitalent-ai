using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.Courses;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/courses")]
public class CoursesController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetCoursesUseCaseOutput>>> GetCourses(
        [FromQuery] GetCoursesUseCaseInput input,
        [FromServices] IUseCase<GetCoursesUseCaseInput, GetCoursesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCoursesUseCaseOutput>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<CourseDetailDto>>> GetCourseById(
        Guid id,
        [FromServices] IUseCase<GetCourseByIdUseCaseInput, CourseDetailDto> useCase)
    {
        var input = new GetCourseByIdUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CourseDetailDto>.Ok(result));
    }
}
