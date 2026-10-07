using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Bài đánh giá & lần làm bài của chính nhân viên (EM-09..13). Chấm điểm và đếm giờ trên server.</summary>
[ApiController]
[Route("api/v1/me")]
public class MyAssessmentsController : ControllerBase
{
    // GET api/v1/me/assessments — EM-09
    [HttpGet("assessments")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetMyAssessmentsUseCaseOutput>>> GetAssessments(
        [FromServices] IUseCase<GetMyAssessmentsUseCaseInput, GetMyAssessmentsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyAssessmentsUseCaseInput());
        return Ok(ApiResponse<GetMyAssessmentsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/assessments/{assessmentId} — EM-10
    [HttpGet("assessments/{assessmentId:guid}")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetMyAssessmentByIdUseCaseOutput>>> GetAssessment(
        Guid assessmentId,
        [FromServices] IUseCase<GetMyAssessmentByIdUseCaseInput, GetMyAssessmentByIdUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyAssessmentByIdUseCaseInput { AssessmentId = assessmentId });
        return Ok(ApiResponse<GetMyAssessmentByIdUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/assessments/{assessmentId}/attempts — EM-11 bắt đầu (hoặc tiếp tục lần đang làm)
    [HttpPost("assessments/{assessmentId:guid}/attempts")]
    [HasPermission(Permissions.Assessment.AttemptStart)]
    public async Task<ActionResult<ApiResponse<MyAttemptSessionDto>>> StartAttempt(
        Guid assessmentId,
        [FromServices] IUseCase<StartMyAssessmentAttemptUseCaseInput, MyAttemptSessionDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = assessmentId });
        return Ok(ApiResponse<MyAttemptSessionDto>.Ok(result));
    }

    // GET api/v1/me/assessment-attempts?pageIndex=1&pageSize=10&passed=true&search= — EM-13
    [HttpGet("assessment-attempts")]
    [HasPermission(Permissions.Assessment.AttemptReadResult)]
    public async Task<ActionResult<ApiResponse<GetMyAttemptHistoryUseCaseOutput>>> GetAttemptHistory(
        [FromQuery] GetMyAttemptHistoryUseCaseInput input,
        [FromServices] IUseCase<GetMyAttemptHistoryUseCaseInput, GetMyAttemptHistoryUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetMyAttemptHistoryUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/assessment-attempts/{attemptId} — EM-11 mở lại lần đang làm (tải lại trang / đổi thiết bị)
    [HttpGet("assessment-attempts/{attemptId:guid}")]
    [HasPermission(Permissions.Assessment.AttemptStart)]
    public async Task<ActionResult<ApiResponse<MyAttemptSessionDto>>> GetAttemptSession(
        Guid attemptId,
        [FromServices] IUseCase<GetMyAttemptSessionUseCaseInput, MyAttemptSessionDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyAttemptSessionUseCaseInput { AttemptId = attemptId });
        return Ok(ApiResponse<MyAttemptSessionDto>.Ok(result));
    }

    // PUT api/v1/me/assessment-attempts/{attemptId}/answers — tự động lưu đáp án
    [HttpPut("assessment-attempts/{attemptId:guid}/answers")]
    [HasPermission(Permissions.Assessment.AttemptStart)]
    public async Task<ActionResult<ApiResponse<SaveMyAttemptAnswersUseCaseOutput>>> SaveAnswers(
        Guid attemptId,
        [FromBody] SaveMyAttemptAnswersUseCaseInput input,
        [FromServices] IUseCase<SaveMyAttemptAnswersUseCaseInput, SaveMyAttemptAnswersUseCaseOutput> useCase)
    {
        input.AttemptId = attemptId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SaveMyAttemptAnswersUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/assessment-attempts/{attemptId}/submit — EM-11 nộp bài → kết quả EM-12
    [HttpPost("assessment-attempts/{attemptId:guid}/submit")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<MyAttemptResultDto>>> Submit(
        Guid attemptId,
        [FromBody] SubmitMyAttemptUseCaseInput input,
        [FromServices] IUseCase<SubmitMyAttemptUseCaseInput, MyAttemptResultDto> useCase)
    {
        input.AttemptId = attemptId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<MyAttemptResultDto>.Ok(result, "Đã nộp bài đánh giá."));
    }

    // GET api/v1/me/assessment-attempts/{attemptId}/result — EM-12
    [HttpGet("assessment-attempts/{attemptId:guid}/result")]
    [HasPermission(Permissions.Assessment.AttemptReadResult)]
    public async Task<ActionResult<ApiResponse<MyAttemptResultDto>>> GetResult(
        Guid attemptId,
        [FromServices] IUseCase<GetMyAttemptResultUseCaseInput, MyAttemptResultDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyAttemptResultUseCaseInput { AttemptId = attemptId });
        return Ok(ApiResponse<MyAttemptResultDto>.Ok(result));
    }
}
