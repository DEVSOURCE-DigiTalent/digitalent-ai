using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Bài đánh giá tổng hợp của nhân viên doanh nghiệp dùng thử, làm trong phòng thi có giám sát. Bản ghi và nhật ký giám sát
/// dùng chung các endpoint /me/pulse/proctoring/{sessionId}/… của bài làm Pulse.
/// </summary>
[ApiController]
[Route("api/v1/me/trial-assessment")]
public class MyTrialAssessmentController : ControllerBase
{
    // GET api/v1/me/trial-assessment
    [HttpGet]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetMyTrialAssessmentUseCaseOutput>>> Get(
        [FromServices] IUseCase<GetMyTrialAssessmentUseCaseInput, GetMyTrialAssessmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        return Ok(ApiResponse<GetMyTrialAssessmentUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/trial-assessment/proctoring — mở phiên làm bài có giám sát, trả về đề
    [HttpPost("proctoring")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<StartMyTrialAssessmentUseCaseOutput>>> Start(
        [FromServices] IUseCase<StartMyTrialAssessmentUseCaseInput, StartMyTrialAssessmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        return Ok(ApiResponse<StartMyTrialAssessmentUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/trial-assessment — nộp bài
    [HttpPost]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitMyTrialAssessmentUseCaseOutput>>> Submit(
        [FromBody] SubmitMyTrialAssessmentUseCaseInput input,
        [FromServices] IUseCase<SubmitMyTrialAssessmentUseCaseInput, SubmitMyTrialAssessmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitMyTrialAssessmentUseCaseOutput>.Ok(result, "Đã nộp bài."));
    }
}
