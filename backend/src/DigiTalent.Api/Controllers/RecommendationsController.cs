using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.Recommendation;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Gợi ý khóa học theo khoảng trống năng lực (spec §5). Tính trực tiếp từ snapshot skill gap mới nhất, không lưu.
/// </summary>
[ApiController]
[Route("api/v1/intelligence/recommendations")]
public class RecommendationsController : ControllerBase
{
    // GET api/v1/intelligence/recommendations?employeeId=&limit=10
    [HttpGet]
    [HasPermission(Permissions.Intelligence.RecommendationRead)]
    public async Task<ActionResult<ApiResponse<GetCourseRecommendationsUseCaseOutput>>> Get(
        [FromQuery] GetCourseRecommendationsUseCaseInput input,
        [FromServices] IUseCase<GetCourseRecommendationsUseCaseInput, GetCourseRecommendationsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        var message = result.Reason == null
            ? $"{result.Items.Count} course(s) recommended."
            : $"No recommendations ({result.Reason}).";
        return Ok(ApiResponse<GetCourseRecommendationsUseCaseOutput>.Ok(result, message));
    }
}
