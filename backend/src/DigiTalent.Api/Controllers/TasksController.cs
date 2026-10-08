using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Tasks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/tasks")]
public class TasksController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<GetTasksOutput>>> GetTasks(
        [FromQuery] GetTasksInput input,
        [FromServices] IUseCase<GetTasksInput, GetTasksOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetTasksOutput>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Task.Read)]
    public async Task<ActionResult<ApiResponse<PracticalTaskDetailDto>>> GetTaskById(
        Guid id,
        [FromServices] IUseCase<GetTaskByIdInput, PracticalTaskDetailDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetTaskByIdInput { Id = id });
        return Ok(ApiResponse<PracticalTaskDetailDto>.Ok(result));
    }

    [HttpPost]
    [HasPermission(Permissions.Task.Create)]
    public async Task<ActionResult<ApiResponse<PracticalTaskDetailDto>>> CreateTask(
        [FromBody] CreateTaskInput input,
        [FromServices] IUseCase<CreateTaskInput, PracticalTaskDetailDto> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PracticalTaskDetailDto>.Ok(result));
    }

    [HttpPost("{taskId:guid}/submit")]
    [HasPermission(Permissions.Task.Submit)]
    public async Task<ActionResult<ApiResponse<TaskSubmissionDto>>> SubmitEvidence(
        Guid taskId,
        [FromBody] SubmitTaskEvidenceInput input,
        [FromServices] IUseCase<SubmitTaskEvidenceInput, TaskSubmissionDto> useCase)
    {
        input.TaskId = taskId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<TaskSubmissionDto>.Ok(result));
    }
}
