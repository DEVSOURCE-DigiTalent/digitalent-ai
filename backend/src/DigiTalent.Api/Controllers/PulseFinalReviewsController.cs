using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Hàng chờ bài cuối khóa Pulse cho quản lý phòng ban / chủ doanh nghiệp (§10). Chưa có màn hình — API để màn quản lý
/// gọi: quyết định có lý do, hai lần nộp, cửa sổ nộp lại theo chính sách doanh nghiệp, cờ hỗ trợ.
/// </summary>
[ApiController]
[Route("api/v1/pulse/final-reviews")]
public class PulseFinalReviewsController : ControllerBase
{
    // GET api/v1/pulse/final-reviews — chờ chấm, đang trong cửa sổ nộp lại, quá hạn, cờ hỗ trợ
    [HttpGet]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<GetPulseFinalReviewsUseCaseOutput>>> GetQueue(
        [FromServices] IUseCase<GetPulseFinalReviewsUseCaseInput, GetPulseFinalReviewsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        return Ok(ApiResponse<GetPulseFinalReviewsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/pulse/final-reviews/{submissionId}/decision — { decision: PASSED | NOT_YET, reason }
    [HttpPost("{submissionId:guid}/decision")]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<DecidePulseFinalUseCaseOutput>>> Decide(
        Guid submissionId,
        [FromBody] DecidePulseFinalUseCaseInput input,
        [FromServices] IUseCase<DecidePulseFinalUseCaseInput, DecidePulseFinalUseCaseOutput> useCase)
    {
        input.SubmissionId = submissionId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<DecidePulseFinalUseCaseOutput>.Ok(result, "Đã ghi quyết định."));
    }

    // POST api/v1/pulse/final-reviews/{submissionId}/support — { action: COACHING | FRESH_CYCLE | PAUSE, note }
    [HttpPost("{submissionId:guid}/support")]
    [HasPermission(Permissions.Task.Evaluate)]
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
