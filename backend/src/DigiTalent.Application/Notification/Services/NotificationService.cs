using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Notifications.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Notifications.Services;

public class NotificationService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationHubService _notificationHub;

    public NotificationService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationHubService notificationHub)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationHub = notificationHub;
    }

    /// <summary>
    /// Returns paginated notifications for the currently authenticated user.
    /// </summary>
    public async Task<PagedList<NotificationResponse>> GetMyNotificationsAsync(PaginationRequest request)
    {
        if (!_currentUser.UserId.HasValue)
            throw new InvalidOperationException("User not authenticated.");

        var query = _context.Notifications
            .Where(n => n.RecipientUserId == _currentUser.UserId.Value);

        var totalItems = await query.CountAsync();

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationResponse
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                RelatedEntityType = n.RelatedEntityType,
                RelatedEntityId = n.RelatedEntityId,
            })
            .ToListAsync();

        return new PagedList<NotificationResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    /// <summary>
    /// Marks a notification as read (only the owner can mark their own notification).
    /// </summary>
    public async Task MarkAsReadAsync(Guid notificationId)
    {
        if (!_currentUser.UserId.HasValue)
            throw new InvalidOperationException("User not authenticated.");

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId
                                      && n.RecipientUserId == _currentUser.UserId.Value)
            ?? throw new KeyNotFoundException("Notification not found or does not belong to you.");

        notification.IsRead = true;
        notification.ReadAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Marks all notifications as read for the current user.
    /// </summary>
    public async Task MarkAllAsReadAsync()
    {
        if (!_currentUser.UserId.HasValue)
            throw new InvalidOperationException("User not authenticated.");

        var now = DateTimeOffset.UtcNow;
        var unread = await _context.Notifications
            .Where(n => n.RecipientUserId == _currentUser.UserId.Value && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }

        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Creates a new notification for a recipient user.
    /// </summary>
    public async Task<NotificationResponse> SendNotificationAsync(SendNotificationRequest request)
    {
        var entity = new Domain.Entities.Shared.Notification
        {
            RecipientUserId = request.RecipientUserId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            RelatedEntityType = request.RelatedEntityType,
            RelatedEntityId = request.RelatedEntityId,
            IsRead = false,
        };

        _context.Notifications.Add(entity);
        await _context.SaveChangesAsync(default);

        // SignalR: push real-time notification
        try
        {
            await _notificationHub.SendNotificationCreated(
                request.RecipientUserId,
                new
                {
                    entity.Id,
                    entity.Type,
                    entity.Title,
                    entity.Message,
                    entity.IsRead,
                    entity.CreatedAt,
                    entity.RelatedEntityType,
                    entity.RelatedEntityId,
                });
        }
        catch { /* SignalR non-critical */ }

        return new NotificationResponse
        {
            Id = entity.Id,
            Type = entity.Type,
            Title = entity.Title,
            Message = entity.Message,
            IsRead = entity.IsRead,
            CreatedAt = entity.CreatedAt,
            RelatedEntityType = entity.RelatedEntityType,
            RelatedEntityId = entity.RelatedEntityId,
        };
    }
}
