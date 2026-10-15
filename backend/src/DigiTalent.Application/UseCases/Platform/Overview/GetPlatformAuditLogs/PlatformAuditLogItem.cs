namespace DigiTalent.Application.UseCases.Platform.Overview;

/// <summary>
/// One audit entry. Reason is read from new_values.reason when the action recorded one.
/// </summary>
public class PlatformAuditLogItem
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? EntityLabel { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public string? ActorEmail { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
