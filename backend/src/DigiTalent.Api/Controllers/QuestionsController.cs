using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Assessments;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/questions")]
public class QuestionsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> GetQuestion(
        Guid id,
        [FromServices] IUseCase<GetQuestionByIdInput, QuestionDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetQuestionByIdInput { Id = id });
        return Ok(ApiResponse<QuestionDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> UpdateQuestion(
        Guid id,
        [FromBody] UpdateQuestionInput input,
        [FromServices] IUseCase<UpdateQuestionInput, QuestionDto> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<QuestionDto>.Ok(result));
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<DeleteQuestionOutput>>> DeleteQuestion(
        Guid id,
        [FromServices] IUseCase<DeleteQuestionInput, DeleteQuestionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new DeleteQuestionInput { Id = id });
        return Ok(ApiResponse<DeleteQuestionOutput>.Ok(result));
    }

    [HttpPatch("{id:guid}/status")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<ChangeQuestionStatusOutput>>> ChangeStatus(
        Guid id,
        [FromBody] ChangeQuestionStatusInput input,
        [FromServices] IUseCase<ChangeQuestionStatusInput, ChangeQuestionStatusOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ChangeQuestionStatusOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/approve")]
    [HasPermission(Permissions.Assessment.QuestionApprovePublish)]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> ApproveQuestion(
        Guid id,
        [FromBody] ApproveQuestionInput input,
        [FromServices] IUseCase<ApproveQuestionInput, QuestionDto> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<QuestionDto>.Ok(result));
    }
}
