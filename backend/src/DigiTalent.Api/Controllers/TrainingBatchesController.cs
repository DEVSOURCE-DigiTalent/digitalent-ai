using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrainingBatches;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/training-batches")]
public class TrainingBatchesController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<GetTrainingBatchesOutput>>> GetList(
        [FromQuery] GetTrainingBatchesInput input,
        [FromServices] IUseCase<GetTrainingBatchesInput, GetTrainingBatchesOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetTrainingBatchesOutput>.Ok(result));
    }

    [HttpGet("summary")]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<TrainingBatchSummaryDto>>> GetSummary(
        [FromServices] IUseCase<GetTrainingBatchSummaryInput, TrainingBatchSummaryDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetTrainingBatchSummaryInput());
        return Ok(ApiResponse<TrainingBatchSummaryDto>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Learning.ReadAssignment)]
    public async Task<ActionResult<ApiResponse<TrainingBatchDetailDto>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetTrainingBatchByIdInput, TrainingBatchDetailDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetTrainingBatchByIdInput { Id = id });
        return Ok(ApiResponse<TrainingBatchDetailDto>.Ok(result));
    }

    [HttpPost]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<CreateTrainingBatchOutput>>> Create(
        [FromBody] CreateTrainingBatchInput input,
        [FromServices] IUseCase<CreateTrainingBatchInput, CreateTrainingBatchOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateTrainingBatchOutput>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<UpdateTrainingBatchOutput>>> Update(
        Guid id,
        [FromBody] UpdateTrainingBatchInput input,
        [FromServices] IUseCase<UpdateTrainingBatchInput, UpdateTrainingBatchOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateTrainingBatchOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/activate")]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<ActivateTrainingBatchOutput>>> Activate(
        Guid id,
        [FromServices] IUseCase<ActivateTrainingBatchInput, ActivateTrainingBatchOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new ActivateTrainingBatchInput { Id = id });
        return Ok(ApiResponse<ActivateTrainingBatchOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/cancel")]
    [HasPermission(Permissions.Learning.CancelAssignment)]
    public async Task<ActionResult<ApiResponse<CancelTrainingBatchOutput>>> Cancel(
        Guid id,
        [FromServices] IUseCase<CancelTrainingBatchInput, CancelTrainingBatchOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CancelTrainingBatchInput { Id = id });
        return Ok(ApiResponse<CancelTrainingBatchOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/complete")]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<CompleteTrainingBatchOutput>>> Complete(
        Guid id,
        [FromServices] IUseCase<CompleteTrainingBatchInput, CompleteTrainingBatchOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CompleteTrainingBatchInput { Id = id });
        return Ok(ApiResponse<CompleteTrainingBatchOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/employees")]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<AddBatchEmployeesOutput>>> AddEmployees(
        Guid id,
        [FromBody] AddBatchEmployeesBody body,
        [FromServices] IUseCase<AddBatchEmployeesInput, AddBatchEmployeesOutput> useCase)
    {
        var input = new AddBatchEmployeesInput { BatchId = id, EmployeeIds = body.EmployeeIds };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<AddBatchEmployeesOutput>.Ok(result));
    }

    [HttpDelete("{id:guid}/employees/{employeeId:guid}")]
    [HasPermission(Permissions.Learning.CancelAssignment)]
    public async Task<ActionResult<ApiResponse<RemoveBatchEmployeeOutput>>> RemoveEmployee(
        Guid id,
        Guid employeeId,
        [FromServices] IUseCase<RemoveBatchEmployeeInput, RemoveBatchEmployeeOutput> useCase)
    {
        var input = new RemoveBatchEmployeeInput { BatchId = id, EmployeeId = employeeId };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<RemoveBatchEmployeeOutput>.Ok(result));
    }
}

public class AddBatchEmployeesBody
{
    public List<Guid> EmployeeIds { get; set; } = new();
}
