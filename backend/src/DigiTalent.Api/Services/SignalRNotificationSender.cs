using DigiTalent.Api.Hubs;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace DigiTalent.Api.Services;

public class SignalRNotificationSender : INotificationSender
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationSender(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUserAsync(Guid userId, string title, string message, string type = "INFO", object? payload = null, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"user_{userId}").SendAsync(
            "ReceiveNotification",
            new
            {
                title,
                message,
                type,
                payload,
                timestamp = DateTimeOffset.UtcNow,
            },
            cancellationToken);
    }

    public async Task SendNotificationToDepartmentAsync(Guid departmentId, string title, string message, string type = "INFO", object? payload = null, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"dept_{departmentId}").SendAsync(
            "ReceiveNotification",
            new
            {
                title,
                message,
                type,
                payload,
                timestamp = DateTimeOffset.UtcNow,
            },
            cancellationToken);
    }
}
