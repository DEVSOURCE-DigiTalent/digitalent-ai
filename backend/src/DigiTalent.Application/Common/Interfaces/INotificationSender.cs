namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Gửi thông báo theo thời gian thực (Real-time in-app notifications qua SignalR):
/// thông báo giao bài học, hạn nộp bài thực hành, phản hồi đánh giá, rủi ro học tập, v.v.
/// </summary>
public interface INotificationSender
{
    Task SendNotificationToUserAsync(Guid userId, string title, string message, string type = "INFO", object? payload = null, CancellationToken cancellationToken = default);
    Task SendNotificationToDepartmentAsync(Guid departmentId, string title, string message, string type = "INFO", object? payload = null, CancellationToken cancellationToken = default);
}
