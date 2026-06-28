using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace DigiTalent.Api.Hubs;

/// <summary>
/// Service to push real-time events via SignalR NotificationHub.
/// Services inject this instead of IHubContext directly to keep coupling minimal.
/// </summary>
public class NotificationHubService : INotificationHubService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationHubService(IHubContext<NotificationHub> hubContext)
        => _hubContext = hubContext;

    /// <summary>
    /// Notify a specific user about a new notification.
    /// </summary>
    public async Task SendNotificationCreated(Guid userId, object notification)
    {
        await _hubContext.Clients.Group($"user:{userId}")
            .SendAsync("NotificationCreated", notification);
    }

    /// <summary>
    /// Notify relevant users about a task status change.
    /// </summary>
    public async Task SendTaskStatusChanged(Guid userId, object taskAssignment)
    {
        await _hubContext.Clients.Group($"user:{userId}")
            .SendAsync("TaskStatusChanged", taskAssignment);
    }

    /// <summary>
    /// Notify an employee about a newly issued certificate.
    /// </summary>
    public async Task SendCertificateIssued(Guid userId, object certificate)
    {
        await _hubContext.Clients.Group($"user:{userId}")
            .SendAsync("CertificateIssued", certificate);
    }

    /// <summary>
    /// Notify HR/Manager about a training risk alert.
    /// </summary>
    public async Task SendTrainingRiskRaised(Guid userId, object trainingRisk)
    {
        await _hubContext.Clients.Group($"user:{userId}")
            .SendAsync("TrainingRiskRaised", trainingRisk);
    }
}
