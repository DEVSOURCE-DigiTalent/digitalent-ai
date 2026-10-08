using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Nhiệm vụ thực tế của chính nhân viên (EM-14..17). Định danh bằng task_assignments.id — chỉ thấy
/// bài nộp / đánh giá của mình (khác GET /tasks/{id} của Manager trả về bài của cả nhóm).
/// </summary>
[ApiController]
[Route("api/v1/me/tasks")]
public class MyTasksController : ControllerBase
{
    // GET api/v1/me/tasks — EM-14
    [HttpGet]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<GetMyTasksUseCaseOutput>>> GetMyTasks(
        [FromServices] IUseCase<GetMyTasksUseCaseInput, GetMyTasksUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyTasksUseCaseInput());
        return Ok(ApiResponse<GetMyTasksUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/tasks/{assignmentId} — EM-15, EM-17
    [HttpGet("{assignmentId:guid}")]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<GetMyTaskDetailUseCaseOutput>>> GetMyTask(
        Guid assignmentId,
        [FromServices] IUseCase<GetMyTaskDetailUseCaseInput, GetMyTaskDetailUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = assignmentId });
        return Ok(ApiResponse<GetMyTaskDetailUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/tasks/{assignmentId}/submissions — EM-16 nộp / nộp lại minh chứng
    [HttpPost("{assignmentId:guid}/submissions")]
    [HasPermission(Permissions.Task.Submit)]
    public async Task<ActionResult<ApiResponse<SubmitMyTaskUseCaseOutput>>> Submit(
        Guid assignmentId,
        [FromBody] SubmitMyTaskUseCaseInput input,
        [FromServices] IUseCase<SubmitMyTaskUseCaseInput, SubmitMyTaskUseCaseOutput> useCase)
    {
        input.AssignmentId = assignmentId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitMyTaskUseCaseOutput>.Ok(result, "Đã nộp minh chứng."));
    }

    // POST api/v1/me/tasks/{assignmentId}/attachments (multipart/form-data, field "file") — EM-16 tải tệp minh chứng
    [HttpPost("{assignmentId:guid}/attachments")]
    [HasPermission(Permissions.Task.Submit)]
    [RequestSizeLimit(MyTaskAttachmentRules.MaxBytes + 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<MyTaskFileDto>>> UploadAttachment(
        Guid assignmentId,
        IFormFile? file,
        [FromServices] IUseCase<UploadMyTaskAttachmentUseCaseInput, MyTaskFileDto> useCase)
    {
        await using var content = file?.OpenReadStream();
        var result = await useCase.ExecuteAsync(new UploadMyTaskAttachmentUseCaseInput
        {
            AssignmentId = assignmentId,
            FileName = file?.FileName ?? string.Empty,
            ContentType = file?.ContentType,
            SizeBytes = file?.Length ?? 0,
            Content = content,
        });
        return Ok(ApiResponse<MyTaskFileDto>.Ok(result, "Đã tải tệp lên."));
    }

    // GET api/v1/me/tasks/{assignmentId}/attachments/{fileId}
    [HttpGet("{assignmentId:guid}/attachments/{fileId:guid}")]
    [HasPermission(Permissions.Task.Read)]
    public async Task<IActionResult> DownloadAttachment(
        Guid assignmentId,
        Guid fileId,
        [FromServices] IUseCase<DownloadMyTaskAttachmentUseCaseInput, MyFileContentDto> useCase)
    {
        var file = await useCase.ExecuteAsync(new DownloadMyTaskAttachmentUseCaseInput { AssignmentId = assignmentId, FileId = fileId });
        return File(file.Content, file.ContentType, file.FileName);
    }
}
