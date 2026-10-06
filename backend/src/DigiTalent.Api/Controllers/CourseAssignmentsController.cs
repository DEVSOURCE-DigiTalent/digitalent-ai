using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.CourseAssignments;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/course-assignments")]
public class CourseAssignmentsController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<GetCourseAssignmentsOutput>>> GetList(
        [FromQuery] GetCourseAssignmentsInput input,
        [FromServices] IUseCase<GetCourseAssignmentsInput, GetCourseAssignmentsOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCourseAssignmentsOutput>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<AssignmentRow>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetCourseAssignmentByIdInput, AssignmentRow> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetCourseAssignmentByIdInput { Id = id });
        return Ok(ApiResponse<AssignmentRow>.Ok(result));
    }

    [HttpGet("summary")]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<AssignmentSummaryOutput>>> GetSummary(
        [FromServices] IUseCase<GetAssignmentSummaryInput, AssignmentSummaryOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetAssignmentSummaryInput());
        return Ok(ApiResponse<AssignmentSummaryOutput>.Ok(result));
    }

    [HttpPost]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<CreateCourseAssignmentOutput>>> Create(
        [FromBody] CreateCourseAssignmentInput input,
        [FromServices] IUseCase<CreateCourseAssignmentInput, CreateCourseAssignmentOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateCourseAssignmentOutput>.Ok(result));
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Learning.CancelAssignment)]
    public async Task<ActionResult<ApiResponse<CancelCourseAssignmentOutput>>> Cancel(
        Guid id,
        [FromBody] CancelAssignmentBody? body,
        [FromServices] IUseCase<CancelCourseAssignmentInput, CancelCourseAssignmentOutput> useCase)
    {
        var input = new CancelCourseAssignmentInput { Id = id, Reason = body?.Reason };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CancelCourseAssignmentOutput>.Ok(result));
    }
}

public class CancelAssignmentBody
{
    public string? Reason { get; set; }
}
