using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Course versions DigiTalent published without applying them to every organization: the caller's organization
/// sees what the newest one changes and applies it or keeps the version it learns from (OWNER, later R&amp;D).
/// </summary>
[ApiController]
[Route("api/v1/course-updates")]
public class CourseUpdatesController : ControllerBase
{
    // GET api/v1/course-updates
    [HttpGet]
    [HasPermission(Permissions.Learning.ReviewCourseUpdate)]
    public async Task<ActionResult<ApiResponse<CourseUpdatesOutput>>> Get(
        [FromServices] IUseCase<GetCourseUpdatesUseCaseInput, CourseUpdatesOutput> useCase) =>
        Ok(ApiResponse<CourseUpdatesOutput>.Ok(await useCase.ExecuteAsync(new GetCourseUpdatesUseCaseInput())));

    // POST api/v1/course-updates/apply — body { versionNo }
    [HttpPost("apply")]
    [HasPermission(Permissions.Learning.ReviewCourseUpdate)]
    public async Task<ActionResult<ApiResponse<CourseUpdatesOutput>>> Apply(
        [FromBody] ApplyCourseUpdateUseCaseInput input,
        [FromServices] IUseCase<ApplyCourseUpdateUseCaseInput, CourseUpdatesOutput> useCase) =>
        Ok(ApiResponse<CourseUpdatesOutput>.Ok(await useCase.ExecuteAsync(input), "Đã áp dụng bản cập nhật khóa học."));

    // POST api/v1/course-updates/keep — body { versionNo, reason }
    [HttpPost("keep")]
    [HasPermission(Permissions.Learning.ReviewCourseUpdate)]
    public async Task<ActionResult<ApiResponse<CourseUpdatesOutput>>> Keep(
        [FromBody] KeepCourseVersionUseCaseInput input,
        [FromServices] IUseCase<KeepCourseVersionUseCaseInput, CourseUpdatesOutput> useCase) =>
        Ok(ApiResponse<CourseUpdatesOutput>.Ok(await useCase.ExecuteAsync(input), "Đã giữ bản khóa học đang dùng."));
}
