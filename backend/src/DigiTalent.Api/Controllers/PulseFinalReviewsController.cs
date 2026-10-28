using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Hàng chờ chấm bài Pulse cho quản lý phòng ban / chủ doanh nghiệp (§10), dùng bởi màn MG-13 /enterprise/team/final-reviews
/// (frontend PulseFinalReviewsPage): bài đánh giá trước khi học và bài cuối khóa kèm bản ghi màn hình / camera và nhật ký
/// giám sát; quyết định có lý do, hai lần nộp bài cuối, cửa sổ nộp lại theo chính sách doanh nghiệp, cờ hỗ trợ.
/// </summary>
[ApiController]
[Route("api/v1/pulse/final-reviews")]
public class PulseFinalReviewsController : ControllerBase
{
    // GET api/v1/pulse/final-reviews — bài đánh giá trước khi học và bài cuối khóa chờ chấm, cửa sổ nộp lại, quá hạn, cờ hỗ trợ
    [HttpGet]
    [HasPermission(Permissions.Task.Evaluate, Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<GetPulseFinalReviewsUseCaseOutput>>> GetQueue(
        [FromServices] IUseCase<GetPulseFinalReviewsUseCaseInput, GetPulseFinalReviewsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        return Ok(ApiResponse<GetPulseFinalReviewsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/pulse/final-reviews/{submissionId}/decision — { decision: PASSED | NOT_YET, reason }
    [HttpPost("{submissionId:guid}/decision")]
    [HasPermission(Permissions.Task.Evaluate, Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<DecidePulseFinalUseCaseOutput>>> Decide(
        Guid submissionId,
        [FromBody] DecidePulseFinalUseCaseInput input,
        [FromServices] IUseCase<DecidePulseFinalUseCaseInput, DecidePulseFinalUseCaseOutput> useCase)
    {
        input.SubmissionId = submissionId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<DecidePulseFinalUseCaseOutput>.Ok(result, "Đã ghi quyết định."));
    }

    // POST api/v1/pulse/final-reviews/pre-assessments/{preAssessmentId}/decision — { decision: PASSED | NOT_YET, reason }
    [HttpPost("pre-assessments/{preAssessmentId:guid}/decision")]
    [HasPermission(Permissions.Task.Evaluate, Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<DecidePulsePreAssessmentUseCaseOutput>>> DecidePreAssessment(
        Guid preAssessmentId,
        [FromBody] DecidePulsePreAssessmentUseCaseInput input,
        [FromServices] IUseCase<DecidePulsePreAssessmentUseCaseInput, DecidePulsePreAssessmentUseCaseOutput> useCase)
    {
        input.PreAssessmentId = preAssessmentId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<DecidePulsePreAssessmentUseCaseOutput>.Ok(result, "Đã ghi quyết định."));
    }

    // POST api/v1/pulse/final-reviews/{submissionId}/support — { action: COACHING | FRESH_CYCLE | PAUSE, note }
    [HttpPost("{submissionId:guid}/support")]
    [HasPermission(Permissions.Task.Evaluate, Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<RecordPulseFinalSupportUseCaseOutput>>> RecordSupport(
        Guid submissionId,
        [FromBody] RecordPulseFinalSupportUseCaseInput input,
        [FromServices] IUseCase<RecordPulseFinalSupportUseCaseInput, RecordPulseFinalSupportUseCaseOutput> useCase)
    {
        input.SubmissionId = submissionId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<RecordPulseFinalSupportUseCaseOutput>.Ok(result, "Đã ghi hướng hỗ trợ."));
    }
}
