using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Khóa học & bài học của chính nhân viên (EM-06..08).</summary>
[ApiController]
[Route("api/v1/me/courses")]
public class MyCoursesController : ControllerBase
{
    // GET api/v1/me/courses — EM-06
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetMyCoursesUseCaseOutput>>> GetMyCourses(
        [FromServices] IUseCase<GetMyCoursesUseCaseInput, GetMyCoursesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyCoursesUseCaseInput());
        return Ok(ApiResponse<GetMyCoursesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/courses/{courseId} — EM-07
    [HttpGet("{courseId:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetMyCourseDetailUseCaseOutput>>> GetCourse(
        Guid courseId,
        [FromServices] IUseCase<GetMyCourseDetailUseCaseInput, GetMyCourseDetailUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyCourseDetailUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<GetMyCourseDetailUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/courses/{courseId}/enroll — tự ghi danh khóa tự chọn (từ lộ trình / gợi ý)
    [HttpPost("{courseId:guid}/enroll")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<EnrollInCourseUseCaseOutput>>> Enroll(
        Guid courseId,
        [FromServices] IUseCase<EnrollInCourseUseCaseInput, EnrollInCourseUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new EnrollInCourseUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<EnrollInCourseUseCaseOutput>.Ok(result, "Đã ghi danh khóa học."));
    }

    // GET api/v1/me/courses/{courseId}/lessons/{lessonId} — EM-08
    [HttpGet("{courseId:guid}/lessons/{lessonId:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetMyLessonUseCaseOutput>>> GetLesson(
        Guid courseId,
        Guid lessonId,
        [FromServices] IUseCase<GetMyLessonUseCaseInput, GetMyLessonUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyLessonUseCaseInput { CourseId = courseId, LessonId = lessonId });
        return Ok(ApiResponse<GetMyLessonUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/courses/{courseId}/lessons/{lessonId}/start — ghi nhận mở bài học
    [HttpPost("{courseId:guid}/lessons/{lessonId:guid}/start")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<StartMyLessonUseCaseOutput>>> StartLesson(
        Guid courseId,
        Guid lessonId,
        [FromServices] IUseCase<StartMyLessonUseCaseInput, StartMyLessonUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new StartMyLessonUseCaseInput { CourseId = courseId, LessonId = lessonId });
        return Ok(ApiResponse<StartMyLessonUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/courses/{courseId}/lessons/{lessonId}/complete
    [HttpPost("{courseId:guid}/lessons/{lessonId:guid}/complete")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<CompleteMyLessonUseCaseOutput>>> CompleteLesson(
        Guid courseId,
        Guid lessonId,
        [FromServices] IUseCase<CompleteMyLessonUseCaseInput, CompleteMyLessonUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CompleteMyLessonUseCaseInput { CourseId = courseId, LessonId = lessonId });
        return Ok(ApiResponse<CompleteMyLessonUseCaseOutput>.Ok(result, "Đã ghi nhận hoàn thành bài học."));
    }

    // GET api/v1/me/courses/{courseId}/lessons/{lessonId}/materials/{materialId}/download
    [HttpGet("{courseId:guid}/lessons/{lessonId:guid}/materials/{materialId:guid}/download")]
    [HasPermission(Permissions.Learning.DownloadViewMaterial)]
    public async Task<IActionResult> DownloadMaterial(
        Guid courseId,
        Guid lessonId,
        Guid materialId,
        [FromServices] IUseCase<DownloadMyLessonMaterialUseCaseInput, MyFileContentDto> useCase)
    {
        var file = await useCase.ExecuteAsync(new DownloadMyLessonMaterialUseCaseInput
        {
            CourseId = courseId,
            LessonId = lessonId,
            MaterialId = materialId,
        });
        return File(file.Content, file.ContentType, file.FileName);
    }
}
