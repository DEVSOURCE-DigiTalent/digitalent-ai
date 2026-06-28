namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Abstraction for pushing real-time events via SignalR.
/// Implementation lives in the API layer (NotificationHubService).
/// </summary>
public interface INotificationHubService
{
    Task SendNotificationCreated(Guid userId, object notification);
    Task SendTaskStatusChanged(Guid userId, object taskAssignment);
    Task SendCertificateIssued(Guid userId, object certificate);
    Task SendTrainingRiskRaised(Guid userId, object trainingRisk);
}
