using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Shared;

public class FileObject : AuditableEntity
{
    public string BucketName { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? ChecksumSha256 { get; set; }
    public string AccessLevel { get; set; } = "PRIVATE";
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public Guid? UploadedByUserId { get; set; }
}

public class Notification : AuditableEntity
{
    public Guid RecipientUserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
}

public class AuditLog : AuditableEntity
{
    public Guid? OrganizationId { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string? IpAddress { get; set; }
}

public class SystemSetting : AuditableEntity
{
    public Guid? OrganizationId { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class ScoringConfig : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public string ConfigType { get; set; } = string.Empty;
    public int Version { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public ICollection<ScoringConfigItem> Items { get; set; } = new List<ScoringConfigItem>();
}

public class ScoringConfigItem : AuditableEntity
{
    public Guid ScoringConfigId { get; set; }
    public ScoringConfig ScoringConfig { get; set; } = null!;
    public string ComponentCode { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public string? Notes { get; set; }
}
