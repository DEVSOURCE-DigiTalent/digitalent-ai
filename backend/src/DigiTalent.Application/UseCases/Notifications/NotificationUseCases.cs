using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Notifications;

public class GetNotificationsUseCase : IUseCase<GetNotificationsInput, GetNotificationsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetNotificationsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetNotificationsOutput> ExecuteAsync(GetNotificationsInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");

        var query = _context.Notifications.AsNoTracking()
            .Where(n => n.RecipientUserId == userId);

        var total = await query.CountAsync();
        var unread = await query.CountAsync(n => !n.IsRead);

        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                RelatedEntityType = n.RelatedEntityType,
                RelatedEntityId = n.RelatedEntityId,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync();

        return new GetNotificationsOutput
        {
            Items = items,
            Total = total,
            Unread = unread,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

public class MarkNotificationReadUseCase : IUseCase<MarkNotificationReadInput, MarkNotificationReadOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public MarkNotificationReadUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<MarkNotificationReadOutput> ExecuteAsync(MarkNotificationReadInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == input.Id && n.RecipientUserId == userId)
            ?? throw new NotFoundException($"Notification '{input.Id}' not found.");

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        return new MarkNotificationReadOutput { Success = true };
    }
}

public class MarkAllNotificationsReadUseCase : IUseCase<MarkAllNotificationsReadInput, MarkAllNotificationsReadOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public MarkAllNotificationsReadUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<MarkAllNotificationsReadOutput> ExecuteAsync(MarkAllNotificationsReadInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");

        var unread = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ToListAsync();

        var now = DateTimeOffset.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }

        await _context.SaveChangesAsync();

        return new MarkAllNotificationsReadOutput { MarkedCount = unread.Count };
    }
}
