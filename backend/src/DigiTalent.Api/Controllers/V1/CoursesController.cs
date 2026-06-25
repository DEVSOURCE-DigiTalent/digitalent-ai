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
        if (request.PageNumber <= 1 && request.PageSize >= 1000)
            return Ok(ApiResponse<PagedList<CourseResponse>>.Ok(
                await _courseService.SearchCoursesAsync(request)));

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
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
        => Ok(ApiResponse<CourseResponse>.Ok(
            await _courseService.CreateCourseAsync(request), "Course created"));

    [HttpPut("courses/{courseId:guid}")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    public async Task<IActionResult> UpdateCourse(Guid courseId, [FromBody] UpdateCourseRequest request)
        => Ok(ApiResponse<CourseResponse>.Ok(
            await _courseService.UpdateCourseAsync(courseId, request)));

    [HttpPatch("courses/{courseId:guid}/status")]
    [HasPermission(PermissionConstants.CoursePublishUnpublish)]
    public async Task<IActionResult> ChangeCourseStatus(Guid courseId, [FromBody] StatusChangeRequest request)
    {
        await _courseService.ChangeCourseStatusAsync(courseId, request.Status);
        return Ok(ApiResponse.Ok(null, "Status updated"));
    }

    [HttpDelete("courses/{courseId:guid}")]
    [HasPermission(PermissionConstants.CourseArchive)]
    public async Task<IActionResult> ArchiveCourse(Guid courseId)
    {
        await _courseService.ChangeCourseStatusAsync(courseId, "ARCHIVED");
        return Ok(ApiResponse.Ok(null, "Course archived"));
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
    public async Task<IActionResult> CreateModule(Guid courseId, [FromBody] CreateModuleRequest request)
        => Ok(ApiResponse<ModuleResponse>.Ok(
            await _courseService.CreateModuleAsync(courseId, request), "Module created"));

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

    [HttpPost("courses/{courseId:guid}/modules/{moduleId:guid}/lessons")]
    [HasPermission(PermissionConstants.CourseUpdate)]
    public async Task<IActionResult> CreateLesson(Guid courseId, Guid moduleId, [FromBody] CreateLessonRequest request)
        => Ok(ApiResponse<LessonResponse>.Ok(
            await _courseService.CreateLessonAsync(courseId, moduleId, request), "Lesson created"));

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

    [HttpPost("courses/{courseId:guid}/materials")]
    [HasPermission(PermissionConstants.MaterialUpload)]
    public async Task<IActionResult> CreateMaterial(Guid courseId, [FromBody] CreateMaterialRequest request)
        => Ok(ApiResponse<MaterialResponse>.Ok(
            await _courseService.CreateMaterialAsync(courseId, request), "Material created"));

    // ═══════════════════════════════════════
    // Course Assignments
    // ═══════════════════════════════════════

    [HttpPost("course-assignments")]
    [HasPermission(PermissionConstants.CourseAssignmentCreate)]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
        => Ok(ApiResponse<AssignmentResponse>.Ok(
            await _enrollmentService.CreateAssignmentAsync(request), "Assignment created"));

    [HttpGet("course-assignments")]
    [HasPermission(PermissionConstants.CourseAssignmentRead)]
    public async Task<IActionResult> SearchAssignments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<AssignmentResponse>>.Ok(
            await _enrollmentService.SearchAssignmentsAsync(request)));

    [HttpPatch("course-assignments/{assignmentId:guid}/cancel")]
    [HasPermission(PermissionConstants.CourseAssignmentCancel)]
    public async Task<IActionResult> CancelAssignment(Guid assignmentId)
    {
        await _enrollmentService.CancelAssignmentAsync(assignmentId);
        return Ok(ApiResponse.Ok(null, "Assignment cancelled"));
    }

    // ═══════════════════════════════════════
    // Enrollments
    // ═══════════════════════════════════════

    [HttpPost("enrollments/start")]
    [HasPermission(PermissionConstants.CourseReadCatalog)]
    public async Task<IActionResult> StartEnrollment([FromBody] StartEnrollmentRequest request)
        => Ok(ApiResponse<EnrollmentResponse>.Ok(
            await _enrollmentService.StartEnrollmentAsync(request), "Enrolled successfully"));

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

    [HttpPut("enrollments/{enrollmentId:guid}/lessons/{lessonId:guid}/complete")]
    [HasPermission(PermissionConstants.LessonComplete)]
    public async Task<IActionResult> CompleteLesson(
        Guid enrollmentId, Guid lessonId, [FromBody] UpdateLessonProgressRequest request)
        => Ok(ApiResponse<LessonProgressResponse>.Ok(
            await _enrollmentService.CompleteLessonAsync(enrollmentId, lessonId, request),
            "Lesson progress updated"));
}
