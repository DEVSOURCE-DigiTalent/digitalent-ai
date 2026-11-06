using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Feedbacks;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/platform/feedbacks")]
public class PlatformFeedbacksController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Feedback.ReadAll)]
    public async Task<ActionResult<ApiResponse<PagedList<FeedbackDto>>>> GetAll(
        [FromQuery] GetAllFeedbacksInput input,
        [FromServices] IUseCase<GetAllFeedbacksInput, PagedList<FeedbackDto>> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PagedList<FeedbackDto>>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Feedback.Manage)]
    public async Task<ActionResult<ApiResponse<UpdateFeedbackStatusOutput>>> UpdateStatus(
        Guid id,
        [FromBody] UpdateFeedbackStatusBody body,
        [FromServices] IUseCase<UpdateFeedbackStatusInput, UpdateFeedbackStatusOutput> useCase)
    {
        var input = new UpdateFeedbackStatusInput
        {
            Id = id,
            Status = body.Status,
            AdminNote = body.AdminNote,
        };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateFeedbackStatusOutput>.Ok(result, "Feedback updated."));
    }
}

public class UpdateFeedbackStatusBody
{
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
}
