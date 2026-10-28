using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Mentor: chấm bài đánh giá tổng hợp của các doanh nghiệp dùng thử được phân công và công bố bảng năng lực.</summary>
[ApiController]
[Route("api/v1/mentor/trials")]
public class MentorTrialsController : ControllerBase
{
    // GET api/v1/mentor/trials
    [HttpGet]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<GetMentorTrialsUseCaseOutput>>> GetList(
        [FromServices] IUseCase<GetMentorTrialsUseCaseInput, GetMentorTrialsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMentorTrialsUseCaseInput());
        return Ok(ApiResponse<GetMentorTrialsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/mentor/trials/{organizationId}
    [HttpGet("{organizationId:guid}")]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<GetMentorTrialUseCaseOutput>>> GetDetail(
        Guid organizationId,
        [FromServices] IUseCase<GetMentorTrialUseCaseInput, GetMentorTrialUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMentorTrialUseCaseInput { OrganizationId = organizationId });
        return Ok(ApiResponse<GetMentorTrialUseCaseOutput>.Ok(result));
    }

    // PUT api/v1/mentor/trials/{organizationId}/assessments/{assessmentId} — body { levels: [{ categoryId, level }], essayScores: [0–10 ×3], note }
    [HttpPut("{organizationId:guid}/assessments/{assessmentId:guid}")]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<ReviewTrialAssessmentUseCaseOutput>>> Review(
        Guid organizationId,
        Guid assessmentId,
        [FromBody] ReviewTrialAssessmentUseCaseInput input,
        [FromServices] IUseCase<ReviewTrialAssessmentUseCaseInput, ReviewTrialAssessmentUseCaseOutput> useCase)
    {
        input.OrganizationId = organizationId;
        input.AssessmentId = assessmentId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ReviewTrialAssessmentUseCaseOutput>.Ok(result, "Đã lưu kết quả chấm."));
    }

    // POST api/v1/mentor/trials/{organizationId}/assessments/{assessmentId}/ai-review — AI gợi ý điểm tự luận
    [HttpPost("{organizationId:guid}/assessments/{assessmentId:guid}/ai-review")]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<TrialEssayAiReviewDto>>> ReviewEssaysWithAi(
        Guid organizationId,
        Guid assessmentId,
        [FromServices] IUseCase<ReviewTrialEssaysWithAiUseCaseInput, TrialEssayAiReviewDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new ReviewTrialEssaysWithAiUseCaseInput { OrganizationId = organizationId, AssessmentId = assessmentId });
        return Ok(ApiResponse<TrialEssayAiReviewDto>.Ok(result));
    }

    // POST api/v1/mentor/trials/{organizationId}/publish
    [HttpPost("{organizationId:guid}/publish")]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<PublishTrialReportUseCaseOutput>>> Publish(
        Guid organizationId,
        [FromServices] IUseCase<PublishTrialReportUseCaseInput, PublishTrialReportUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new PublishTrialReportUseCaseInput { OrganizationId = organizationId });
        return Ok(ApiResponse<PublishTrialReportUseCaseOutput>.Ok(result, "Đã công bố kết quả."));
    }
}
