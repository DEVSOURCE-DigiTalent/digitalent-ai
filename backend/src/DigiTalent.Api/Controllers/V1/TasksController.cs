using DigiTalent.Api.Authorization;
using DigiTalent.Application.Tasks.DTOs;
using DigiTalent.Application.Tasks.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    // ═══════════════════════════════════════
    // Practical Tasks
    // ═══════════════════════════════════════

    [HttpGet("practical-tasks")]
    [HasPermission(PermissionConstants.TaskRead)]
    public async Task<IActionResult> SearchTasks([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<PracticalTaskResponse>>.Ok(
            await _taskService.SearchTasksAsync(request)));

    [HttpPost("practical-tasks")]
    [HasPermission(PermissionConstants.TaskCreate)]
    [ProducesResponseType(typeof(ApiResponse<PracticalTaskResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var result = await _taskService.CreateTaskAsync(request);
        return CreatedAtAction(nameof(GetTask), new { taskId = result.Id },
            ApiResponse<PracticalTaskResponse>.Ok(result, "Task created"));
    }

    [HttpGet("practical-tasks/{taskId:guid}")]
    [HasPermission(PermissionConstants.TaskRead)]
    public async Task<IActionResult> GetTask(Guid taskId)
        => Ok(ApiResponse<PracticalTaskDetailResponse>.Ok(
            await _taskService.GetTaskAsync(taskId)));

    [HttpPut("practical-tasks/{taskId:guid}")]
    [HasPermission(PermissionConstants.TaskCreate)]
    public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] UpdateTaskRequest request)
        => Ok(ApiResponse<PracticalTaskResponse>.Ok(
            await _taskService.UpdateTaskAsync(taskId, request), "Task updated"));

    [HttpPost("practical-tasks/{taskId:guid}/assign")]
    [HasPermission(PermissionConstants.TaskAssign)]
    [ProducesResponseType(typeof(ApiResponse<TaskAssignmentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AssignTask(Guid taskId, [FromBody] AssignTaskRequest request)
    {
        var result = await _taskService.AssignTaskAsync(taskId, request);
        return CreatedAtAction(nameof(GetAssignment), new { assignmentId = result.Id },
            ApiResponse<TaskAssignmentResponse>.Ok(result, "Task assigned"));
    }

    // ═══════════════════════════════════════
    // Task Assignments
    // ═══════════════════════════════════════

    [HttpGet("task-assignments")]
    [HasPermission(PermissionConstants.TaskRead)]
    public async Task<IActionResult> SearchAssignments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<TaskAssignmentResponse>>.Ok(
            await _taskService.SearchAssignmentsAsync(request)));

    [HttpGet("task-assignments/{assignmentId:guid}")]
    [HasPermission(PermissionConstants.TaskRead)]
    public async Task<IActionResult> GetAssignment(Guid assignmentId)
        => Ok(ApiResponse<TaskAssignmentDetailResponse>.Ok(
            await _taskService.GetAssignmentAsync(assignmentId)));

    [HttpPost("task-assignments/{assignmentId:guid}/submit")]
    [HasPermission(PermissionConstants.TaskSubmit)]
    [ProducesResponseType(typeof(ApiResponse<TaskSubmissionResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> SubmitTask(Guid assignmentId, [FromBody] SubmitTaskRequest request)
    {
        var result = await _taskService.SubmitTaskAsync(assignmentId, request);
        return CreatedAtAction(nameof(GetAssignment), new { assignmentId },
            ApiResponse<TaskSubmissionResponse>.Ok(result, "Task submitted"));
    }

    [HttpPost("task-assignments/{assignmentId:guid}/evaluate")]
    [HasPermission(PermissionConstants.TaskEvaluate)]
    [ProducesResponseType(typeof(ApiResponse<TaskEvaluationResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> EvaluateTask(Guid assignmentId, [FromBody] EvaluateTaskRequest request)
    {
        var result = await _taskService.EvaluateTaskAsync(assignmentId, request);
        return CreatedAtAction(nameof(GetAssignment), new { assignmentId },
            ApiResponse<TaskEvaluationResponse>.Ok(result, "Task evaluated"));
    }

    [HttpPatch("task-assignments/{assignmentId:guid}/status")]
    [HasPermission(PermissionConstants.TaskUpdateProgress)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeTaskStatus(Guid assignmentId, [FromBody] TaskStatusUpdateRequest request)
    {
        await _taskService.UpdateAssignmentStatusAsync(assignmentId, request.Status);
        return NoContent();
    }

    [HttpPost("task-assignments/{assignmentId:guid}/reopen")]
    [HasPermission(PermissionConstants.TaskReopen)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ReopenTask(Guid assignmentId)
    {
        await _taskService.ReopenTaskAsync(assignmentId);
        return NoContent();
    }
}
