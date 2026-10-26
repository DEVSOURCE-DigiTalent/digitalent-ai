using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>
/// Dịch vụ ngầm tự động quét và gửi thông báo/email nhắc nhở nhân sự
/// khi các khóa học hoặc bài tập thực hành sắp đến hạn (trong vòng 24h - 48h).
/// </summary>
public class DeadlineReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeadlineReminderBackgroundService> _logger;

    public DeadlineReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<DeadlineReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[DeadlineReminderBackgroundService] Background service started.");

        // Chờ 30 giây sau khi server khởi động để DB và các service sẵn sàng
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DeadlineReminderBackgroundService] Error occurred while processing deadline reminders.");
            }

            // Quét định kỳ mỗi 2 giờ
            try
            {
                await Task.Delay(TimeSpan.FromHours(2), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("[DeadlineReminderBackgroundService] Background service stopped.");
    }

    private async Task ProcessDueRemindersAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailSender = scope.ServiceProvider.GetRequiredService<IAppEmailSender>();
        var notificationSender = scope.ServiceProvider.GetRequiredService<INotificationSender>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tomorrow = today.AddDays(1);
        var recentThreshold = DateTimeOffset.UtcNow.AddHours(-20);

        // 1. Quét khóa học sắp hết hạn (DueDate là hôm nay hoặc ngày mai)
        var nearDueAssignments = await context.CourseAssignments.AsNoTracking()
            .Where(ca => ca.Status == "ACTIVE" && ca.DueDate != null && ca.DueDate.Value >= today && ca.DueDate.Value <= tomorrow)
            .Take(100)
            .ToListAsync(ct);

        if (nearDueAssignments.Count > 0)
        {
            var empIds = nearDueAssignments.Select(a => a.EmployeeId).Distinct().ToList();
            var courseIds = nearDueAssignments.Select(a => a.CourseId).Distinct().ToList();

            var employees = await context.Employees.AsNoTracking()
                .Where(e => empIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, ct);

            var courses = await context.Courses.AsNoTracking()
                .Where(c => courseIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, ct);

            foreach (var assignment in nearDueAssignments)
            {
                if (!employees.TryGetValue(assignment.EmployeeId, out var emp)) continue;
                if (!courses.TryGetValue(assignment.CourseId, out var course)) continue;

                // Kiểm tra xem đã gửi nhắc nhở trong 20 giờ qua chưa để tránh gửi lặp
                if (emp.UserId.HasValue)
                {
                    var alreadyReminded = await context.Notifications.AsNoTracking()
                        .AnyAsync(n => n.RecipientUserId == emp.UserId.Value
                                       && n.Type == "DEADLINE_REMINDER"
                                       && n.RelatedEntityId == course.Id
                                       && n.CreatedAt >= recentThreshold, ct);

                    if (!alreadyReminded)
                    {
                        var dueDateStr = assignment.DueDate?.ToString("dd/MM/yyyy") ?? "sắp tới";
                        var title = $"[Nhắc nhở] Sắp đến hạn: {course.Title}";
                        var msg = $"Khóa học '{course.Title}' của bạn có hạn hoàn thành vào ngày {dueDateStr}. Vui lòng sắp xếp hoàn thành đúng hạn.";

                        var noti = new Notification
                        {
                            RecipientUserId = emp.UserId.Value,
                            Type = "DEADLINE_REMINDER",
                            Title = title,
                            Message = msg,
                            RelatedEntityType = "COURSE",
                            RelatedEntityId = course.Id,
                            IsRead = false,
                            CreatedAt = DateTimeOffset.UtcNow,
                            UpdatedAt = DateTimeOffset.UtcNow
                        };

                        context.Notifications.Add(noti);
                        await context.SaveChangesAsync(ct);

                        try
                        {
                            await notificationSender.SendNotificationToUserAsync(emp.UserId.Value, title, msg, "DEADLINE_REMINDER", cancellationToken: ct);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "[DeadlineReminderBackgroundService] Realtime noti failed for user {UserId}", emp.UserId.Value);
                        }

                        if (!string.IsNullOrWhiteSpace(emp.WorkEmail))
                        {
                            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: sans-serif; background-color: #f7f9fd; padding: 24px; color: #172442;'>
    <div style='max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; border: 1px solid #dfe6f3;'>
        <div style='font-size: 13px; font-weight: bold; color: #ea580c; background: #fff7ed; padding: 6px 12px; border-radius: 20px; display: inline-block;'>SẮP HẾT HẠN HOÀN THÀNH</div>
        <h3 style='color: #172442; margin-top: 16px;'>Nhắc nhở thời hạn học tập</h3>
        <p>Kính gửi <strong>{emp.FullName}</strong>,</p>
        <p>Hệ thống DigiTalent AI xin nhắc bạn khóa học sau sắp đến thời hạn hoàn thành:</p>
        <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;'>
            <div style='font-weight: bold; color: #1e293b; font-size: 15px;'>{course.Code} · {course.Title}</div>
            <div style='color: #ea580c; font-weight: 600; margin-top: 6px;'>Hạn hoàn thành: {dueDateStr}</div>
        </div>
        <p style='text-align: center; margin-top: 24px;'>
            <a href='http://localhost:5173/enterprise/my-learning' style='background: #304bdf; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Tiếp tục học ngay</a>
        </p>
    </div>
</body>
</html>";
                            await emailSender.SendEmailAsync(emp.WorkEmail, emp.FullName, title, htmlBody, ct);
                        }
                    }
                }
            }
        }
    }
}
