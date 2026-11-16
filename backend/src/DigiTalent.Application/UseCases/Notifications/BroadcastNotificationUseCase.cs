using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Application.UseCases.Notifications;

public class BroadcastNotificationUseCase : IUseCase<BroadcastNotificationInput, BroadcastNotificationOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationSender _notificationSender;
    private readonly IAppEmailSender _emailSender;
    private readonly IAppUrlResolver _urlResolver;
    private readonly ILogger<BroadcastNotificationUseCase> _logger;

    public BroadcastNotificationUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        INotificationSender notificationSender,
        IAppEmailSender emailSender,
        IAppUrlResolver urlResolver,
        ILogger<BroadcastNotificationUseCase> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationSender = notificationSender;
        _emailSender = emailSender;
        _urlResolver = urlResolver;
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
        var query = new EmployeeScope(_context, _currentUser).VisibleEmployees().AsNoTracking()
            .Where(e => e.Status == Statuses.Employee.Active);

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
            var baseUrl = _urlResolver.GetFrontendBaseUrl();
            // A relative link ("/enterprise/...") becomes absolute so it opens from the mailbox.
            var actionUrl = string.IsNullOrWhiteSpace(input.ActionUrl) ? baseUrl + "/enterprise"
                : input.ActionUrl.StartsWith('/') ? baseUrl + input.ActionUrl
                : input.ActionUrl;

            foreach (var emp in employees)
            {
                var email = !string.IsNullOrWhiteSpace(emp.WorkEmail)
                    ? emp.WorkEmail
                    : (emp.UserId.HasValue && userMap.TryGetValue(emp.UserId.Value, out var uEmail) ? uEmail : null);

                if (string.IsNullOrWhiteSpace(email))
                    continue;

                var htmlBody = EmailTemplateBuilder.BuildBroadcastNotificationEmail(
                    emp.FullName,
                    orgName,
                    input.Title.Trim(),
                    input.Message.Trim(),
                    parsedDueDate,
                    actionUrl);

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
