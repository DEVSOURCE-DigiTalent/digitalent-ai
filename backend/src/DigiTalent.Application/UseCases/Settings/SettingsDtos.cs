using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Settings;

// ──────────────── Organization ────────────────

public class GetOrganizationInput { }

public class OrganizationDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string Status { get; set; } = string.Empty;
    public Dictionary<string, object?> Settings { get; set; } = new();
}

public class UpdateOrgSettingsInput
{
    public Dictionary<string, string> Settings { get; set; } = new();
}
public class UpdateOrgSettingsOutput { public bool Success { get; set; } }

// ──────────────── Audit Log ────────────────

public class GetAuditLogInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? EntityType { get; set; }
    public string? Action { get; set; }
    public string? Search { get; set; }
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? ActorUserId { get; set; }
    public string? ActorName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class GetAuditLogOutput : PagedList<AuditLogDto> { }
