using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Assessment.QuestionBanks;
using DigiTalent.Application.UseCases.Assessment.QuestionTags;
using DigiTalent.Application.UseCases.Assessment.Questions;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class QuestionBanksController : ControllerBase
{
    // ── Question Banks ──────────────────────────────────

    // GET api/v1/question-banks?pageIndex=1&pageSize=20&search=general
    [HttpGet("question-banks")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<GetPagedQuestionBanksUseCaseOutput>>> GetPagedBanks(
        [FromQuery] GetPagedQuestionBanksUseCaseInput input,
        [FromServices] IUseCase<GetPagedQuestionBanksUseCaseInput, GetPagedQuestionBanksUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedQuestionBanksUseCaseOutput>.Ok(result));
    }

    // POST api/v1/question-banks
    [HttpPost("question-banks")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateQuestionBankUseCaseOutput>>> CreateBank(
        [FromBody] CreateQuestionBankUseCaseInput input,
        [FromServices] IUseCase<CreateQuestionBankUseCaseInput, CreateQuestionBankUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateQuestionBankUseCaseOutput>.Ok(result, "Question bank created."));
    }

    // DELETE api/v1/question-banks/{id}
    [HttpDelete("question-banks/{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<DeleteQuestionBankUseCaseOutput>>> DeleteBank(
        Guid id,
        [FromServices] IUseCase<DeleteQuestionBankUseCaseInput, DeleteQuestionBankUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new DeleteQuestionBankUseCaseInput { Id = id });
        return Ok(ApiResponse<DeleteQuestionBankUseCaseOutput>.Ok(result, "Question bank deleted."));
    }

    // ── Taxonomy Tags ────────────────────────────────────

    // GET api/v1/question-tags
    [HttpGet("question-tags")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<GetQuestionTagsUseCaseOutput>>> GetTags(
        [FromServices] IUseCase<GetQuestionTagsUseCaseInput, GetQuestionTagsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetQuestionTagsUseCaseInput());
        return Ok(ApiResponse<GetQuestionTagsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/question-tags
    [HttpPost("question-tags")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateQuestionTagUseCaseOutput>>> CreateTag(
        [FromBody] CreateQuestionTagUseCaseInput input,
        [FromServices] IUseCase<CreateQuestionTagUseCaseInput, CreateQuestionTagUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateQuestionTagUseCaseOutput>.Ok(result, "Tag created."));
    }

    // ── Questions ────────────────────────────────────────

    // GET api/v1/question-banks/{bankId}/questions?pageIndex=1&pageSize=20&search=&tagId=
    [HttpGet("question-banks/{bankId:guid}/questions")]
    [HasPermission(Permissions.Assessment.QuestionBankRead)]
    public async Task<ActionResult<ApiResponse<GetPagedQuestionsUseCaseOutput>>> GetPagedQuestions(
        Guid bankId,
        [FromQuery] GetPagedQuestionsUseCaseInput input,
        [FromServices] IUseCase<GetPagedQuestionsUseCaseInput, GetPagedQuestionsUseCaseOutput> useCase)
    {
        input.BankId = bankId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedQuestionsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/question-banks/{bankId}/questions
    [HttpPost("question-banks/{bankId:guid}/questions")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateQuestionUseCaseOutput>>> CreateQuestion(
        Guid bankId,
        [FromBody] CreateQuestionUseCaseInput input,
        [FromServices] IUseCase<CreateQuestionUseCaseInput, CreateQuestionUseCaseOutput> useCase)
    {
        input.BankId = bankId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateQuestionUseCaseOutput>.Ok(result, "Question created."));
    }

    // PUT api/v1/questions/{id}
    [HttpPut("questions/{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateQuestionUseCaseOutput>>> UpdateQuestion(
        Guid id,
        [FromBody] UpdateQuestionUseCaseInput input,
        [FromServices] IUseCase<UpdateQuestionUseCaseInput, UpdateQuestionUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateQuestionUseCaseOutput>.Ok(result, "Question updated."));
    }

    // DELETE api/v1/questions/{id}
    [HttpDelete("questions/{id:guid}")]
    [HasPermission(Permissions.Assessment.QuestionCreateUpdate)]
    public async Task<ActionResult<ApiResponse<DeleteQuestionUseCaseOutput>>> DeleteQuestion(
        Guid id,
        [FromServices] IUseCase<DeleteQuestionUseCaseInput, DeleteQuestionUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new DeleteQuestionUseCaseInput { Id = id });
        return Ok(ApiResponse<DeleteQuestionUseCaseOutput>.Ok(result, "Question deleted."));
    }

    // POST api/v1/questions/{id}/approve
    [HttpPost("questions/{id:guid}/approve")]
    [HasPermission(Permissions.Assessment.QuestionApprovePublish)]
    public async Task<ActionResult<ApiResponse<ApproveQuestionUseCaseOutput>>> ApproveQuestion(
        Guid id,
        [FromServices] IUseCase<ApproveQuestionUseCaseInput, ApproveQuestionUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new ApproveQuestionUseCaseInput { Id = id });
        return Ok(ApiResponse<ApproveQuestionUseCaseOutput>.Ok(result, "Question approved."));
    }
}
