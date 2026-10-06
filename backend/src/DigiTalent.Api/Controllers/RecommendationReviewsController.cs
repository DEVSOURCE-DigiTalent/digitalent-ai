using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.RecommendationReviews;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/intelligence/recommendation-reviews")]
public class RecommendationReviewsController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Intelligence.RecommendationRead)]
    public async Task<ActionResult<ApiResponse<GetRecommendationReviewsOutput>>> GetList(
        [FromQuery] GetRecommendationReviewsInput input,
        [FromServices] IUseCase<GetRecommendationReviewsInput, GetRecommendationReviewsOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetRecommendationReviewsOutput>.Ok(result));
    }

    [HttpPost("accept")]
    [HasPermission(Permissions.Learning.CreateAssignment)]
    public async Task<ActionResult<ApiResponse<ReviewActionOutput>>> Accept(
        [FromBody] AcceptReviewInput input,
        [FromServices] IUseCase<AcceptReviewInput, ReviewActionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ReviewActionOutput>.Ok(result));
    }

    [HttpPost("dismiss")]
    [HasPermission(Permissions.Intelligence.RecommendationRead)]
    public async Task<ActionResult<ApiResponse<ReviewActionOutput>>> Dismiss(
        [FromBody] DismissReviewInput input,
        [FromServices] IUseCase<DismissReviewInput, ReviewActionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ReviewActionOutput>.Ok(result));
    }

    [HttpPost("reopen")]
    [HasPermission(Permissions.Intelligence.RecommendationRead)]
    public async Task<ActionResult<ApiResponse<ReviewActionOutput>>> Reopen(
        [FromBody] ReopenReviewInput input,
        [FromServices] IUseCase<ReopenReviewInput, ReviewActionOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ReviewActionOutput>.Ok(result));
    }
}
