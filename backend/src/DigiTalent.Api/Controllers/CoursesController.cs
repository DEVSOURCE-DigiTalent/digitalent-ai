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
        [FromServices] IUseCase<GetCoursesUseCaseInput, GetCoursesUseCaseOutput> useCase,
        [FromServices] DigiTalent.Infrastructure.Persistence.AppDbContext db,
        [FromServices] DigiTalent.Application.Common.Interfaces.ICurrentUser currentUser)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId.HasValue)
        {
            await DigiTalent.Infrastructure.Persistence.Seed.SkillGapSeeder.EnsureOrganizationFrameworkAndCoursesAsync(db, orgId.Value, currentUser.UserId);
        }
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

    [HttpPost("{id:guid}/purchase-seats")]
    [HasPermission(Permissions.Learning.Create)]
    public async Task<ActionResult<ApiResponse<DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats.PurchaseCourseSeatsOutput>>> PurchaseSeats(
        Guid id,
        [FromBody] DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats.PurchaseCourseSeatsInput input,
        [FromServices] IUseCase<DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats.PurchaseCourseSeatsInput, DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats.PurchaseCourseSeatsOutput> useCase)
    {
        input.CourseId = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats.PurchaseCourseSeatsOutput>.Ok(result, "Đã mua suất học thành công."));
    }
}
