using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Assessments;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/question-banks")]
public class QuestionBanksController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<GetQuestionBanksOutput>>> GetQuestionBanks(
        [FromQuery] GetQuestionBanksInput input,
        [FromServices] IUseCase<GetQuestionBanksInput, GetQuestionBanksOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetQuestionBanksOutput>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<QuestionBankDto>>> GetQuestionBankById(
        Guid id,
        [FromServices] IUseCase<GetQuestionBankByIdInput, QuestionBankDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetQuestionBankByIdInput { Id = id });
        return Ok(ApiResponse<QuestionBankDto>.Ok(result));
    }

    [HttpPost]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<QuestionBankDto>>> CreateQuestionBank(
        [FromBody] CreateQuestionBankInput input,
        [FromServices] IUseCase<CreateQuestionBankInput, QuestionBankDto> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<QuestionBankDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<QuestionBankDto>>> UpdateQuestionBank(
        Guid id,
        [FromBody] UpdateQuestionBankInput input,
        [FromServices] IUseCase<UpdateQuestionBankInput, QuestionBankDto> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<QuestionBankDto>.Ok(result));
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<DeleteQuestionBankOutput>>> DeleteQuestionBank(
        Guid id,
        [FromServices] IUseCase<DeleteQuestionBankInput, DeleteQuestionBankOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new DeleteQuestionBankInput { Id = id });
        return Ok(ApiResponse<DeleteQuestionBankOutput>.Ok(result));
    }

    [HttpGet("{bankId:guid}/questions")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<GetQuestionsOutput>>> GetQuestions(
        Guid bankId,
        [FromQuery] GetQuestionsInput input,
        [FromServices] IUseCase<GetQuestionsInput, GetQuestionsOutput> useCase)
    {
        input.BankId = bankId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetQuestionsOutput>.Ok(result));
    }

    [HttpPost("{bankId:guid}/questions")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> CreateQuestion(
        Guid bankId,
        [FromBody] CreateQuestionInput input,
        [FromServices] IUseCase<CreateQuestionInput, QuestionDto> useCase)
    {
        input.BankId = bankId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<QuestionDto>.Ok(result));
    }
}
