using DigiTalent.Api.Authorization;
using DigiTalent.Application.Assessment.DTOs;
using DigiTalent.Application.Assessment.Services;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class AssessmentsController : ControllerBase
{
    private readonly QuestionBankService _questionBankService;
    private readonly AssessmentService _assessmentService;
    private readonly AttemptService _attemptService;

    public AssessmentsController(
        QuestionBankService questionBankService,
        AssessmentService assessmentService,
        AttemptService attemptService)
    {
        _questionBankService = questionBankService;
        _assessmentService = assessmentService;
        _attemptService = attemptService;
    }

    // ═══════════════════════════════════════
    // Question Banks
    // ═══════════════════════════════════════

    [HttpGet("question-banks")]
    [HasPermission(PermissionConstants.QuestionBankRead)]
    public async Task<IActionResult> SearchBanks([FromQuery] PaginationRequest request)
    {
        if (request.PageIndex <= 1 && request.PageSize >= 1000)
            return Ok(ApiResponse<List<QuestionBankResponse>>.Ok(
                await _questionBankService.GetAllBanksAsync()));

        return Ok(ApiResponse<PagedList<QuestionBankResponse>>.Ok(
            await _questionBankService.SearchBanksAsync(request)));
    }

    [HttpGet("question-banks/{bankId:guid}")]
    [HasPermission(PermissionConstants.QuestionBankRead)]
    public async Task<IActionResult> GetBank(Guid bankId)
        => Ok(ApiResponse<QuestionBankResponse>.Ok(
            await _questionBankService.GetBankAsync(bankId)));

    [HttpPost("question-banks")]
    [HasPermission(PermissionConstants.QuestionCreateUpdate)]
    [ProducesResponseType(typeof(ApiResponse<QuestionBankResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateBank([FromBody] CreateQuestionBankRequest request)
    {
        var result = await _questionBankService.CreateBankAsync(request);
        return CreatedAtAction(nameof(GetBank), new { bankId = result.Id },
            ApiResponse<QuestionBankResponse>.Ok(result, "Question bank created"));
    }

    [HttpPut("question-banks/{bankId:guid}")]
    [HasPermission(PermissionConstants.QuestionCreateUpdate)]
    public async Task<IActionResult> UpdateBank(Guid bankId, [FromBody] UpdateQuestionBankRequest request)
        => Ok(ApiResponse<QuestionBankResponse>.Ok(
            await _questionBankService.UpdateBankAsync(bankId, request)));

    // ═══════════════════════════════════════
    // Questions
    // ═══════════════════════════════════════

    [HttpGet("question-banks/{bankId:guid}/questions")]
    [HasPermission(PermissionConstants.QuestionBankRead)]
    public async Task<IActionResult> SearchQuestions(Guid bankId, [FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<QuestionResponse>>.Ok(
            await _questionBankService.SearchQuestionsAsync(bankId, request)));

    [HttpPost("question-banks/{bankId:guid}/questions")]
    [HasPermission(PermissionConstants.QuestionCreateUpdate)]
    [ProducesResponseType(typeof(ApiResponse<QuestionDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateQuestion(Guid bankId, [FromBody] CreateQuestionRequest request)
    {
        var result = await _questionBankService.CreateQuestionAsync(bankId, request);
        return CreatedAtAction(nameof(GetQuestion), new { questionId = result.Id },
            ApiResponse<QuestionDetailResponse>.Ok(result, "Question created"));
    }

    [HttpGet("questions/{questionId:guid}")]
    [HasPermission(PermissionConstants.QuestionBankRead)]
    public async Task<IActionResult> GetQuestion(Guid questionId)
        => Ok(ApiResponse<QuestionDetailResponse>.Ok(
            await _questionBankService.GetQuestionAsync(questionId)));

    [HttpPut("questions/{questionId:guid}")]
    [HasPermission(PermissionConstants.QuestionCreateUpdate)]
    public async Task<IActionResult> UpdateQuestion(Guid questionId, [FromBody] UpdateQuestionRequest request)
        => Ok(ApiResponse<QuestionDetailResponse>.Ok(
            await _questionBankService.UpdateQuestionAsync(questionId, request)));

    [HttpPatch("questions/{questionId:guid}/status")]
    [HasPermission(PermissionConstants.QuestionApprovePublish)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeQuestionStatus(Guid questionId, [FromBody] StatusChangeRequest request)
    {
        await _questionBankService.ChangeQuestionStatusAsync(questionId, request.Status);
        return NoContent();
    }

    /// <summary>
    /// Approve AI/manual draft for official use.
    /// </summary>
    [HttpPost("questions/{questionId:guid}/approve")]
    [HasPermission(PermissionConstants.QuestionApprovePublish)]
    public async Task<IActionResult> ApproveQuestion(Guid questionId, [FromBody] ApprovalRequest request)
        => Ok(ApiResponse<QuestionDetailResponse>.Ok(
            await _questionBankService.ApproveQuestionAsync(questionId, request),
            "Question approved"));

    [HttpPost("question-banks/{bankId:guid}/questions/ai-draft")]
    [HasPermission(PermissionConstants.QuestionAiGenerateDraft)]
    public async Task<IActionResult> GenerateAiDraft(Guid bankId, [FromQuery] Guid competencyId, [FromQuery] int count = 5)
        => Ok(ApiResponse<List<QuestionDetailResponse>>.Ok(
            await _questionBankService.GenerateAiDraftAsync(bankId, competencyId, count),
            $"{count} AI draft questions generated"));

    // ═══════════════════════════════════════
    // Assessments
    // ═══════════════════════════════════════

    [HttpGet("assessments")]
    [HasPermission(PermissionConstants.AssessmentRead)]
    public async Task<IActionResult> SearchAssessments([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<AssessmentResponse>>.Ok(
            await _assessmentService.SearchAssessmentsAsync(request)));

    [HttpGet("assessments/by-course/{courseId:guid}")]
    [HasPermission(PermissionConstants.AssessmentRead)]
    public async Task<IActionResult> GetAssessmentsByCourse(Guid courseId)
        => Ok(ApiResponse<List<AssessmentResponse>>.Ok(
            await _assessmentService.GetAssessmentsByCourseAsync(courseId)));

    [HttpPost("assessments")]
    [HasPermission(PermissionConstants.AssessmentCreateUpdate)]
    [ProducesResponseType(typeof(ApiResponse<AssessmentResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAssessment([FromBody] CreateAssessmentRequest request)
    {
        var result = await _assessmentService.CreateAssessmentAsync(request);
        return CreatedAtAction(nameof(GetAssessment), new { assessmentId = result.Id },
            ApiResponse<AssessmentResponse>.Ok(result, "Assessment created"));
    }

    [HttpGet("assessments/{assessmentId:guid}")]
    [HasPermission(PermissionConstants.AssessmentRead)]
    public async Task<IActionResult> GetAssessment(Guid assessmentId)
        => Ok(ApiResponse<AssessmentDetailResponse>.Ok(
            await _assessmentService.GetAssessmentAsync(assessmentId)));

    [HttpPut("assessments/{assessmentId:guid}")]
    [HasPermission(PermissionConstants.AssessmentCreateUpdate)]
    public async Task<IActionResult> UpdateAssessment(Guid assessmentId, [FromBody] UpdateAssessmentRequest request)
        => Ok(ApiResponse<AssessmentResponse>.Ok(
            await _assessmentService.UpdateAssessmentAsync(assessmentId, request)));

    [HttpPatch("assessments/{assessmentId:guid}/status")]
    [HasPermission(PermissionConstants.AssessmentPublishClose)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeAssessmentStatus(Guid assessmentId, [FromBody] StatusChangeRequest request)
    {
        await _assessmentService.ChangeAssessmentStatusAsync(assessmentId, request.Status);
        return NoContent();
    }

    // ═══════════════════════════════════════
    // Assessment Questions
    // ═══════════════════════════════════════

    [HttpGet("assessments/{assessmentId:guid}/questions")]
    [HasPermission(PermissionConstants.AssessmentRead)]
    public async Task<IActionResult> GetAssessmentQuestions(Guid assessmentId)
        => Ok(ApiResponse<List<AssessmentQuestionResponse>>.Ok(
            await _assessmentService.GetAssessmentQuestionsAsync(assessmentId)));

    [HttpPut("assessments/{assessmentId:guid}/questions")]
    [HasPermission(PermissionConstants.AssessmentCreateUpdate)]
    public async Task<IActionResult> SaveAssessmentQuestions(
        Guid assessmentId, [FromBody] SaveAssessmentQuestionsRequest request)
        => Ok(ApiResponse<List<AssessmentQuestionResponse>>.Ok(
            await _assessmentService.SaveAssessmentQuestionsAsync(assessmentId, request),
            "Assessment questions saved"));

    // ═══════════════════════════════════════
    // Assessment Attempts
    // ═══════════════════════════════════════

    [HttpPost("assessments/{assessmentId:guid}/attempts/start")]
    [HasPermission(PermissionConstants.AttemptStart)]
    [ProducesResponseType(typeof(ApiResponse<StartAttemptResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> StartAttempt(Guid assessmentId, [FromQuery] Guid enrollmentId)
    {
        var result = await _attemptService.StartAttemptAsync(assessmentId, enrollmentId);
        return CreatedAtAction(nameof(GetAttemptResult), new { attemptId = result.AttemptId },
            ApiResponse<StartAttemptResponse>.Ok(result, "Attempt started"));
    }

    [HttpPost("assessment-attempts/{attemptId:guid}/submit")]
    [HasPermission(PermissionConstants.AttemptSubmit)]
    public async Task<IActionResult> SubmitAttempt(Guid attemptId, [FromBody] SubmitAttemptRequest request)
        => Ok(ApiResponse<SubmitAttemptResponse>.Ok(
            await _attemptService.SubmitAttemptAsync(attemptId, request), "Attempt submitted"));

    [HttpGet("assessment-attempts/{attemptId:guid}")]
    [HasPermission(PermissionConstants.AttemptReadResult)]
    public async Task<IActionResult> GetAttemptResult(Guid attemptId)
        => Ok(ApiResponse<AttemptDetailResponse>.Ok(
            await _attemptService.GetAttemptResultAsync(attemptId)));

    [HttpPost("assessment-attempts/{attemptId:guid}/regrade")]
    [HasPermission(PermissionConstants.AttemptRegradeOverride)]
    public async Task<IActionResult> RegradeAttempt(Guid attemptId, [FromBody] RegradeAttemptRequest request)
        => Ok(ApiResponse<AttemptDetailResponse>.Ok(
            await _attemptService.RegradeAttemptAsync(attemptId, request), "Attempt regraded"));
}
