using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Tasks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/review-queue")]
public class ReviewQueueController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<GetReviewQueueOutput>>> GetReviewQueue(
        [FromQuery] GetReviewQueueInput input,
        [FromServices] IUseCase<GetReviewQueueInput, GetReviewQueueOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetReviewQueueOutput>.Ok(result));
    }
}
