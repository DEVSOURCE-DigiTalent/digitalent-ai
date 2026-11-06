using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Feedbacks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/feedbacks")]
public class FeedbacksController : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Feedback.Create)]
    public async Task<ActionResult<ApiResponse<CreateFeedbackOutput>>> Create(
        [FromBody] CreateFeedbackInput input,
        [FromServices] IUseCase<CreateFeedbackInput, CreateFeedbackOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateFeedbackOutput>.Ok(result, "Feedback created."));
    }

    [HttpGet("mine")]
    [HasPermission(Permissions.Feedback.ReadOwn)]
    public async Task<ActionResult<ApiResponse<PagedList<FeedbackDto>>>> GetMine(
        [FromQuery] GetMyFeedbacksInput input,
        [FromServices] IUseCase<GetMyFeedbacksInput, PagedList<FeedbackDto>> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PagedList<FeedbackDto>>.Ok(result));
    }
}
