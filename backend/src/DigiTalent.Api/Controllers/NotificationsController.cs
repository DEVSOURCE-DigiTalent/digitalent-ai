using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Notifications;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationsController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Notification.ReadOwn)]
    public async Task<ActionResult<ApiResponse<GetNotificationsOutput>>> GetNotifications(
        [FromQuery] GetNotificationsInput input,
        [FromServices] IUseCase<GetNotificationsInput, GetNotificationsOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetNotificationsOutput>.Ok(result));
    }

    [HttpPut("{id:guid}/read")]
    [HasPermission(Permissions.Notification.MarkRead)]
    public async Task<ActionResult<ApiResponse<MarkNotificationReadOutput>>> MarkRead(
        Guid id,
        [FromServices] IUseCase<MarkNotificationReadInput, MarkNotificationReadOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new MarkNotificationReadInput { Id = id });
        return Ok(ApiResponse<MarkNotificationReadOutput>.Ok(result));
    }

    [HttpPut("read-all")]
    [HasPermission(Permissions.Notification.MarkRead)]
    public async Task<ActionResult<ApiResponse<MarkAllNotificationsReadOutput>>> MarkAllRead(
        [FromServices] IUseCase<MarkAllNotificationsReadInput, MarkAllNotificationsReadOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new MarkAllNotificationsReadInput());
        return Ok(ApiResponse<MarkAllNotificationsReadOutput>.Ok(result));
    }
}
