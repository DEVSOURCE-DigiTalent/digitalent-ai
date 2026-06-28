using DigiTalent.Api.Authorization;
using DigiTalent.Application.Learning.DTOs;
using DigiTalent.Application.Learning.Services;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class CoursesController : ControllerBase
{
    private readonly CourseService _courseService;
    private readonly EnrollmentService _enrollmentService;

    public CoursesController(CourseService courseService, EnrollmentService enrollmentService)
    {
        _courseService = courseService;
        _enrollmentService = enrollmentService;
    }

    // ═══════════════════════════════════════
    // Courses
    // ═══════════════════════════════════════

    [HttpGet("courses")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> SearchCourses([FromQuery] PaginationRequest request)
    {
        return Ok(ApiResponse<PagedList<CourseResponse>>.Ok(
            await _courseService.SearchCoursesAsync(request)));
    }

    [HttpGet("courses/{courseId:guid}")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetCourse(Guid courseId)
        => Ok(ApiResponse<CourseDetailResponse>.Ok(
            await _courseService.GetCourseAsync(courseId)));

    [HttpPost("courses")]
    [HasPermission(PermissionConstants.CourseCreate)]
    [ProducesResponseType(typeof(ApiResponse<CourseResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var result = await _courseService.CreateCourseAsync(request);
        return CreatedAtAction(nameof(GetCourse), new { courseId = result.Id },
            ApiResponse<CourseResponse>.Ok(result, "Course created"));
    }

    [HttpPut("courses/{courseId:guid}")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    public async Task<IActionResult> UpdateCourse(Guid courseId, [FromBody] UpdateCourseRequest request)
        => Ok(ApiResponse<CourseResponse>.Ok(
            await _courseService.UpdateCourseAsync(courseId, request)));

    /// <summary>
    /// Publish course when required content is valid.
    /// </summary>
    [HttpPost("courses/{courseId:guid}/publish")]
    [HasPermission(PermissionConstants.CoursePublishUnpublish)]
    public async Task<IActionResult> PublishCourse(Guid courseId, [FromBody] PublishCourseRequest request)
        => Ok(ApiResponse<CourseResponse>.Ok(
            await _courseService.PublishCourseAsync(courseId, request),
            "Course published"));

    [HttpPatch("courses/{courseId:guid}/status")]
    [HasPermission(PermissionConstants.CoursePublishUnpublish)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeCourseStatus(Guid courseId, [FromBody] StatusChangeRequest request)
    {
        await _courseService.ChangeCourseStatusAsync(courseId, request.Status);
        return NoContent();
    }

    [HttpDelete("courses/{courseId:guid}")]
    [HasPermission(PermissionConstants.CourseArchive)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ArchiveCourse(Guid courseId)
    {
        await _courseService.ChangeCourseStatusAsync(courseId, "ARCHIVED");
        return NoContent();
    }

    // ═══════════════════════════════════════
    // Modules
    // ═══════════════════════════════════════

    [HttpGet("courses/{courseId:guid}/modules")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetModules(Guid courseId)
        => Ok(ApiResponse<List<ModuleResponse>>.Ok(
            await _courseService.GetModulesAsync(courseId)));

    [HttpGet("courses/{courseId:guid}/modules/{moduleId:guid}")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetModule(Guid courseId, Guid moduleId)
        => Ok(ApiResponse<ModuleDetailResponse>.Ok(
            await _courseService.GetModuleAsync(courseId, moduleId)));

    [HttpPost("courses/{courseId:guid}/modules")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    [ProducesResponseType(typeof(ApiResponse<ModuleResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateModule(Guid courseId, [FromBody] CreateModuleRequest request)
    {
        var result = await _courseService.CreateModuleAsync(courseId, request);
        return CreatedAtAction(nameof(GetModule), new { courseId, moduleId = result.Id },
            ApiResponse<ModuleResponse>.Ok(result, "Module created"));
    }

    [HttpPut("courses/{courseId:guid}/modules/{moduleId:guid}")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    public async Task<IActionResult> UpdateModule(Guid courseId, Guid moduleId, [FromBody] UpdateModuleRequest request)
        => Ok(ApiResponse<ModuleResponse>.Ok(
            await _courseService.UpdateModuleAsync(courseId, moduleId, request)));

    // ═══════════════════════════════════════
    // Lessons
    // ═══════════════════════════════════════

    [HttpGet("courses/{courseId:guid}/modules/{moduleId:guid}/lessons")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetLessons(Guid courseId, Guid moduleId)
        => Ok(ApiResponse<List<LessonResponse>>.Ok(
            await _courseService.GetLessonsAsync(courseId, moduleId)));

    [HttpGet("courses/{courseId:guid}/modules/{moduleId:guid}/lessons/{lessonId:guid}")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetLesson(Guid courseId, Guid moduleId, Guid lessonId)
        => Ok(ApiResponse<LessonDetailResponse>.Ok(
            await _courseService.GetLessonAsync(courseId, moduleId, lessonId)));

    [HttpPost("modules/{moduleId:guid}/lessons")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    [ProducesResponseType(typeof(ApiResponse<LessonResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateLesson(Guid moduleId, [FromBody] CreateLessonRequest request)
    {
        var module = await _courseService.GetModuleEntityAsync(moduleId);
        var result = await _courseService.CreateLessonAsync(module.CourseId, moduleId, request);
        return CreatedAtAction(nameof(GetLesson), new { courseId = module.CourseId, moduleId, lessonId = result.Id },
            ApiResponse<LessonResponse>.Ok(result, "Lesson created"));
    }

    [HttpPut("courses/{courseId:guid}/modules/{moduleId:guid}/lessons/{lessonId:guid}")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    public async Task<IActionResult> UpdateLesson(Guid courseId, Guid moduleId, Guid lessonId, [FromBody] UpdateLessonRequest request)
        => Ok(ApiResponse<LessonResponse>.Ok(
            await _courseService.UpdateLessonAsync(courseId, moduleId, lessonId, request)));

    // ═══════════════════════════════════════
    // Course Competencies
    // ═══════════════════════════════════════

    [HttpGet("courses/{courseId:guid}/competencies")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetCourseCompetencies(Guid courseId)
        => Ok(ApiResponse<List<CourseCompetencyResponse>>.Ok(
            await _courseService.GetCourseCompetenciesAsync(courseId)));

    [HttpPut("courses/{courseId:guid}/competencies")]
    [HasPermission(PermissionConstants.CourseCompetencyManage)]
    public async Task<IActionResult> SaveCourseCompetencies(
        Guid courseId, [FromBody] SaveCourseCompetenciesRequest request)
        => Ok(ApiResponse<List<CourseCompetencyResponse>>.Ok(
            await _courseService.SaveCourseCompetenciesAsync(courseId, request),
            "Competencies saved"));

    // ═══════════════════════════════════════
    // Learning Materials
    // ═══════════════════════════════════════

    [HttpPost("lessons/{lessonId:guid}/materials")]
    [HasPermission(PermissionConstants.MaterialUpload)]
    [ProducesResponseType(typeof(ApiResponse<MaterialResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMaterial(Guid lessonId, [FromBody] CreateMaterialRequest request)
    {
        var lesson = await _courseService.GetLessonEntityAsync(lessonId);
        request.LessonId = lessonId;
        var result = await _courseService.CreateMaterialAsync(lesson.Module.CourseId, request);
        return CreatedAtAction(nameof(GetCourse), new { courseId = lesson.Module.CourseId },
            ApiResponse<MaterialResponse>.Ok(result, "Material created"));
    }

    // ═══════════════════════════════════════
    // Course Assignments
    // ═══════════════════════════════════════

    [HttpPost("course-assignments")]
    [HasPermission(PermissionConstants.CourseAssignmentCreate)]
    [ProducesResponseType(typeof(ApiResponse<AssignmentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        var result = await _enrollmentService.CreateAssignmentAsync(request);
        return CreatedAtAction(nameof(SearchAssignments), new { assignmentId = result.Id },
            ApiResponse<AssignmentResponse>.Ok(result, "Assignment created"));
    }

    [HttpGet("course-assignments")]
    [HasPermission(PermissionConstants.CourseAssignmentRead)]
    public async Task<IActionResult> SearchAssignments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<AssignmentResponse>>.Ok(
            await _enrollmentService.SearchAssignmentsAsync(request)));

    [HttpPatch("course-assignments/{assignmentId:guid}/cancel")]
    [HasPermission(PermissionConstants.CourseAssignmentCancel)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CancelAssignment(Guid assignmentId)
    {
        await _enrollmentService.CancelAssignmentAsync(assignmentId);
        return NoContent();
    }

    // ═══════════════════════════════════════
    // Enrollments
    // ═══════════════════════════════════════

    [HttpPost("enrollments/start")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> StartEnrollment([FromBody] StartEnrollmentRequest request)
    {
        var result = await _enrollmentService.StartEnrollmentAsync(request);
        return CreatedAtAction(nameof(GetEnrollment), new { enrollmentId = result.Id },
            ApiResponse<EnrollmentResponse>.Ok(result, "Enrolled successfully"));
    }

    [HttpGet("enrollments/my")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> GetMyEnrollments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<EnrollmentResponse>>.Ok(
            await _enrollmentService.GetMyEnrollmentsAsync(request)));

    [HttpGet("enrollments")]
    [HasPermission(PermissionConstants.LearningProgressRead)]
    public async Task<IActionResult> SearchEnrollments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<EnrollmentResponse>>.Ok(
            await _enrollmentService.SearchEnrollmentsAsync(request)));

    [HttpGet("enrollments/{enrollmentId:guid}")]
    [HasPermission(PermissionConstants.LearningProgressRead)]
    public async Task<IActionResult> GetEnrollment(Guid enrollmentId)
        => Ok(ApiResponse<EnrollmentDetailResponse>.Ok(
            await _enrollmentService.GetEnrollmentAsync(enrollmentId)));

    // ═══════════════════════════════════════
    // Lesson Progress
    // ═══════════════════════════════════════

    /// <summary>
    /// Mark lesson completed and update learning progress.
    /// </summary>
    [HttpPost("lessons/{lessonId:guid}/complete")]
    [HasPermission(PermissionConstants.LessonComplete)]
    public async Task<IActionResult> CompleteLesson(
        Guid lessonId, [FromQuery] Guid enrollmentId, [FromBody] LessonCompletionRequest request)
        => Ok(ApiResponse<LessonProgressResponse>.Ok(
            await _enrollmentService.CompleteLessonAsync(enrollmentId, lessonId,
                new UpdateLessonProgressRequest
                {
                    Status = "COMPLETED",
                    ProgressPercent = request.ProgressPercent ?? 100,
                }),
            "Lesson completed"));
}
