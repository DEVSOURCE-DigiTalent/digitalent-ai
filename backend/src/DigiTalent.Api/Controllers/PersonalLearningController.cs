using DigiTalent.Api.Common;
using DigiTalent.Application.PersonalLearning.Dtos;
using DigiTalent.Application.PersonalLearning.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/personal")]
[Authorize]
public sealed class PersonalLearningController(IPersonalLearningService service) : ControllerBase
{
    // GET api/v1/personal/overview
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(CancellationToken cancellationToken)
    {
        var result = await service.GetOverviewAsync(cancellationToken);
        return Ok(ApiResponse<PersonalOverviewDto>.Ok(result));
    }

    // PUT api/v1/personal/target
    [HttpPut("target")]
    public async Task<IActionResult> SetTarget([FromBody] SetPersonalTargetRequest request, CancellationToken cancellationToken)
    {
        var result = await service.SetTargetAsync(request.PositionCode, cancellationToken);
        return Ok(ApiResponse<PersonalTargetDto>.Ok(result, "Đã lưu vị trí mục tiêu."));
    }

    // GET api/v1/personal/skill-gap
    [HttpGet("skill-gap")]
    public async Task<IActionResult> GetSkillGap(CancellationToken cancellationToken)
    {
        var result = await service.GetSkillGapAsync(cancellationToken);
        return Ok(ApiResponse<PersonalSkillGapDto>.Ok(result));
    }

    // GET api/v1/personal/diagnostic
    [HttpGet("diagnostic")]
    public async Task<IActionResult> GetDiagnostic(CancellationToken cancellationToken)
    {
        var result = await service.GetDiagnosticAsync(cancellationToken);
        return Ok(ApiResponse<PersonalDiagnosticDto>.Ok(result));
    }

    // POST api/v1/personal/diagnostic
    [HttpPost("diagnostic")]
    public async Task<IActionResult> SubmitDiagnostic([FromBody] SubmitDiagnosticRequest request, CancellationToken cancellationToken)
    {
        var result = await service.SubmitDiagnosticAsync(request.Answers, cancellationToken);
        return Ok(ApiResponse<DiagnosticResultDto>.Ok(result, "Đã ghi nhận bài đánh giá đầu vào."));
    }

    // GET api/v1/personal/path
    [HttpGet("path")]
    public async Task<IActionResult> GetPath(CancellationToken cancellationToken)
    {
        var result = await service.GetPathAsync(cancellationToken);
        return Ok(ApiResponse<PersonalPathDto>.Ok(result));
    }

    // GET api/v1/personal/courses/{id}
    [HttpGet("courses/{id}")]
    public async Task<IActionResult> GetCourseDetail(string id, CancellationToken cancellationToken)
    {
        var result = await service.GetCourseDetailAsync(id, cancellationToken);
        return Ok(ApiResponse<PersonalCourseDetailDto>.Ok(result));
    }

    // PUT api/v1/personal/courses/{id}/lessons/{lessonId}
    [HttpPut("courses/{id}/lessons/{lessonId}")]
    public async Task<IActionResult> UpdateLessonProgress(
        string id,
        string lessonId,
        [FromBody] UpdateLessonProgressRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateLessonProgressAsync(id, lessonId, request.Completed, cancellationToken);
        return Ok(ApiResponse<PersonalCourseDetailDto>.Ok(result));
    }

    // PUT api/v1/personal/courses/{id}/notes
    [HttpPut("courses/{id}/notes")]
    public async Task<IActionResult> SaveCourseNotes(
        string id,
        [FromBody] SaveCourseNotesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.SaveCourseNotesAsync(id, request.Notes, cancellationToken);
        return Ok(ApiResponse<CourseNotesDto>.Ok(result, "Đã lưu ghi chú."));
    }

    // GET api/v1/personal/courses/{id}/assessment
    [HttpGet("courses/{id}/assessment")]
    public async Task<IActionResult> GetCourseAssessment(string id, CancellationToken cancellationToken)
    {
        var result = await service.GetCourseAssessmentAsync(id, cancellationToken);
        return Ok(ApiResponse<CourseAssessmentDto>.Ok(result));
    }

    // POST api/v1/personal/courses/{id}/assessment
    [HttpPost("courses/{id}/assessment")]
    public async Task<IActionResult> SubmitCourseAssessment(
        string id,
        [FromBody] SubmitCourseAssessmentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.SubmitCourseAssessmentAsync(id, request.Answers, cancellationToken);
        return Ok(ApiResponse<AssessmentOutcomeDto>.Ok(result));
    }

    // GET api/v1/personal/tasks
    [HttpGet("tasks")]
    public async Task<IActionResult> GetTasks(CancellationToken cancellationToken)
    {
        var result = await service.GetTasksAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<PersonalTaskDto>>.Ok(result));
    }

    // POST api/v1/personal/tasks/{id}/submissions
    [HttpPost("tasks/{id}/submissions")]
    public async Task<IActionResult> SubmitTask(
        string id,
        [FromBody] SubmitTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.SubmitTaskAsync(id, request, cancellationToken);
        return StatusCode(201, ApiResponse<PersonalTaskDto>.Ok(result, "Đã nộp bài thực hành."));
    }

    // GET api/v1/personal/certificates
    [HttpGet("certificates")]
    public async Task<IActionResult> GetCertificates(CancellationToken cancellationToken)
    {
        var result = await service.GetCertificatesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<PersonalCertificateDto>>.Ok(result));
    }

    // GET api/v1/personal/progress
    [HttpGet("progress")]
    public async Task<IActionResult> GetProgress(CancellationToken cancellationToken)
    {
        var result = await service.GetProgressAsync(cancellationToken);
        return Ok(ApiResponse<PersonalProgressDto>.Ok(result));
    }

    // GET api/v1/personal/access
    [HttpGet("access")]
    public async Task<IActionResult> GetAccess(CancellationToken cancellationToken)
    {
        var result = await service.GetAccessAsync(cancellationToken);
        return Ok(ApiResponse<PersonalAccessDto>.Ok(result));
    }

    // PUT api/v1/personal/seen/{key}
    [HttpPut("seen/{key}")]
    public async Task<IActionResult> MarkSeen(string key, CancellationToken cancellationToken)
    {
        var result = await service.MarkSeenAsync(key, cancellationToken);
        return Ok(ApiResponse<IReadOnlyDictionary<string, string>>.Ok(result));
    }

    // GET api/v1/personal/certificates/verify/{code} (Công khai, không cần đăng nhập)
    [HttpGet("certificates/verify/{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyCertificate(string code, CancellationToken cancellationToken)
    {
        var result = await service.VerifyCertificateAsync(code, cancellationToken);
        if (result == null)
        {
            return NotFound(ApiResponse<PersonalCertificateDto?>.Fail("Chứng nhận không tồn tại hoặc mã tra cứu không hợp lệ."));
        }
        return Ok(ApiResponse<PersonalCertificateDto>.Ok(result, "Xác thực chứng chỉ thành công."));
    }
}
