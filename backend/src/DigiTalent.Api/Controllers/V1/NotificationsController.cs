using DigiTalent.Api.Authorization;
using DigiTalent.Application.Notifications.DTOs;
using DigiTalent.Application.Notifications.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Get own notifications (paginated).
    /// </summary>
    [HttpGet("notifications")]
    [HasPermission(PermissionConstants.NotificationReadOwn)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<NotificationResponse>>.Ok(
            await _notificationService.GetMyNotificationsAsync(request)));

    /// <summary>
    /// Mark a notification as read.
    /// </summary>
    [HttpPatch("notifications/{id:guid}/read")]
    [HasPermission(PermissionConstants.NotificationMarkRead)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Mark all notifications as read.
    /// </summary>
    [HttpPost("notifications/read-all")]
    [HasPermission(PermissionConstants.NotificationMarkRead)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync();
        return NoContent();
    }

    /// <summary>
    /// Send a notification to a user (admin/system use).
    /// </summary>
    [HttpPost("notifications/send")]
    [HasPermission(PermissionConstants.NotificationSend)]
    [ProducesResponseType(typeof(ApiResponse<NotificationResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
    {
        var result = await _notificationService.SendNotificationAsync(request);
        return CreatedAtAction(nameof(GetMyNotifications), new { },
            ApiResponse<NotificationResponse>.Ok(result, "Notification sent"));
    }
}
