namespace DigiTalent.Application.UseCases.Notifications;

public class GetNotificationsInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class GetNotificationsOutput
{
    public List<NotificationDto> Items { get; set; } = new();
    public int Total { get; set; }
    public int Unread { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
}

public class MarkNotificationReadInput { public Guid Id { get; set; } }
public class MarkNotificationReadOutput { public bool Success { get; set; } }

public class MarkAllNotificationsReadInput { }
public class MarkAllNotificationsReadOutput { public int MarkedCount { get; set; } }
