using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.Notifications;

public class BroadcastNotificationUseCase : IUseCase<BroadcastNotificationInput, BroadcastNotificationOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationSender _notificationSender;
    private readonly IAppEmailSender _emailSender;
    private readonly ILogger<BroadcastNotificationUseCase> _logger;

    public BroadcastNotificationUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        INotificationSender notificationSender,
        IAppEmailSender emailSender,
        ILogger<BroadcastNotificationUseCase> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationSender = notificationSender;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<BroadcastNotificationOutput> ExecuteAsync(BroadcastNotificationInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Title))
            throw new BadRequestException("Tiêu đề thông báo không được để trống.");

        if (string.IsNullOrWhiteSpace(input.Message))
            throw new BadRequestException("Nội dung thông báo không được để trống.");

        var organizationId = _currentUser.GetRequiredOrganizationId();
        var organization = await _context.Organizations.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == organizationId);
        var orgName = organization?.Name ?? "DigiTalent AI";

        DateOnly? parsedDueDate = null;
        if (!string.IsNullOrWhiteSpace(input.DueDate) && DateOnly.TryParse(input.DueDate, out var d))
        {
            parsedDueDate = d;
        }

        // 1. Phân giải danh sách nhân viên nhận thông báo
        var query = _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.Status == Statuses.Employee.Active);

        var hasDeptFilter = input.TargetDepartmentIds != null && input.TargetDepartmentIds.Count > 0;
        var hasEmpFilter = input.TargetEmployeeIds != null && input.TargetEmployeeIds.Count > 0;

        if (hasDeptFilter && hasEmpFilter)
        {
            query = query.Where(e => input.TargetDepartmentIds!.Contains(e.DepartmentId) || input.TargetEmployeeIds!.Contains(e.Id));
        }
        else if (hasDeptFilter)
        {
            query = query.Where(e => input.TargetDepartmentIds!.Contains(e.DepartmentId));
        }
        else if (hasEmpFilter)
        {
            query = query.Where(e => input.TargetEmployeeIds!.Contains(e.Id));
        }

        var employees = await query.ToListAsync();
        if (employees.Count == 0)
        {
            throw new BadRequestException("Không tìm thấy nhân viên nào phù hợp với đối tượng đã chọn.");
        }

        // Lấy thông tin user tương ứng để gửi email nếu WorkEmail bị trống
        var userIds = employees.Where(e => e.UserId.HasValue).Select(e => e.UserId!.Value).Distinct().ToList();
        var userMap = await _context.Users.AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email);

        var output = new BroadcastNotificationOutput
        {
            TotalRecipients = employees.Count,
            DueDate = parsedDueDate?.ToString("dd/MM/yyyy"),
            RecipientNames = employees.Select(e => e.FullName).Take(50).ToList()
        };

        var notificationsToAdd = new List<Notification>();
        var fullMessage = parsedDueDate.HasValue
            ? $"{input.Message.Trim()} (Hạn hoàn thành: {parsedDueDate.Value:dd/MM/yyyy})"
            : input.Message.Trim();

        // 2. Tạo thông báo in-app và bắn SignalR realtime
        foreach (var emp in employees)
        {
            if (emp.UserId.HasValue)
            {
                var notification = new Notification
                {
                    RecipientUserId = emp.UserId.Value,
                    Type = string.IsNullOrWhiteSpace(input.Type) ? "ANNOUNCEMENT" : input.Type.ToUpperInvariant(),
                    Title = input.Title.Trim(),
                    Message = fullMessage,
                    RelatedEntityType = "ORGANIZATION_BROADCAST",
                    RelatedEntityId = organizationId,
                    IsRead = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                notificationsToAdd.Add(notification);

                // Realtime notification
                try
                {
                    await _notificationSender.SendNotificationToUserAsync(
                        emp.UserId.Value,
                        input.Title.Trim(),
                        fullMessage,
                        notification.Type);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[BroadcastNotificationUseCase] Failed to send SignalR notification to user {UserId}.", emp.UserId.Value);
                }
            }
        }

        if (notificationsToAdd.Count > 0)
        {
            _context.Notifications.AddRange(notificationsToAdd);
            await _context.SaveChangesAsync();
            output.InAppNotificationCount = notificationsToAdd.Count;
        }

        // 3. Gửi Email nếu được bật
        if (input.SendEmail)
        {
            var emailTasks = new List<Task>();
            var actionUrl = !string.IsNullOrWhiteSpace(input.ActionUrl)
                ? input.ActionUrl
                : "http://localhost:5173/enterprise";

            foreach (var emp in employees)
            {
                var email = !string.IsNullOrWhiteSpace(emp.WorkEmail)
                    ? emp.WorkEmail
                    : (emp.UserId.HasValue && userMap.TryGetValue(emp.UserId.Value, out var uEmail) ? uEmail : null);

                if (string.IsNullOrWhiteSpace(email))
                    continue;

                var deadlineBadgeHtml = parsedDueDate.HasValue
                    ? $@"<div style='background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 20px 0; border-radius: 6px;'>
                            <strong style='color: #9a3412; font-size: 14px;'>Thời hạn hoàn thành:</strong>
                            <span style='color: #c2410c; font-weight: bold; font-size: 15px; margin-left: 8px;'>{parsedDueDate.Value:dd/MM/yyyy}</span>
                        </div>"
                    : "";

                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fd; margin: 0; padding: 24px; color: #172442; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #dfe6f3; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }}
        .header {{ border-bottom: 1px solid #eef2ff; padding-bottom: 20px; margin-bottom: 24px; text-align: center; }}
        .brand {{ font-size: 20px; font-weight: bold; color: #304bdf; }}
        .org-tag {{ display: inline-block; background: #edf1ff; color: #304bdf; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-top: 6px; }}
        .title {{ font-size: 18px; font-weight: bold; color: #172442; margin-bottom: 16px; }}
        .content {{ font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }}
        .btn {{ display: inline-block; background: #304bdf; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 24px 0 16px; text-align: center; }}
        .footer {{ font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='brand'>DigiTalent AI</div>
            <div class='org-tag'>{orgName}</div>
        </div>
        <div class='title'>{input.Title.Trim()}</div>
        <p style='font-size: 14px; color: #64748b; margin-top: 0;'>Kính gửi <strong>{emp.FullName}</strong>,</p>
        <div class='content'>{input.Message.Trim()}</div>
        {deadlineBadgeHtml}
        <div style='text-align: center;'>
            <a href='{actionUrl}' class='btn'>Vào hệ thống xem chi tiết</a>
        </div>
        <div class='footer'>
            Email này được gửi tự động từ Ban Quản trị {orgName} qua hệ thống DigiTalent AI.<br>
            Vui lòng đăng nhập hệ thống để xem và hoàn thành nhiệm vụ đúng thời hạn.
        </div>
    </div>
</body>
</html>";

                emailTasks.Add(_emailSender.SendEmailAsync(
                    email,
                    emp.FullName,
                    $"[{orgName}] {input.Title.Trim()}",
                    htmlBody));
            }

            // Gửi bất đồng bộ không chặn
            var results = await Task.WhenAll(emailTasks.Cast<Task<bool>>());
            output.EmailsSentCount = results.Count(r => r);
        }

        return output;
    }
}
