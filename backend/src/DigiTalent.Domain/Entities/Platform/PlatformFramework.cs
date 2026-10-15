using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_frameworks: one competency framework of the platform (the Circular 02/2025 standard and any
/// framework Platform Admin adds). A framework owns its domains; its descriptions are published as framework
/// versions, its courses are published with catalog versions.
/// </summary>
public class PlatformFramework : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>Published framework version; 0 = never published.</summary>
    public int CurrentVersionNo { get; set; }
    public int SortOrder { get; set; }
    public Guid? CreatedByUserId { get; set; }
}

/// <summary>
/// Table platform_framework_domains: one domain of a framework. Platform Admin edits the draft description and
/// publishes it as a new framework version.
/// </summary>
public class PlatformFrameworkDomain : BaseEntity
{
    public Guid FrameworkId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string PublishedDescription { get; set; } = string.Empty;
    public string DraftDescription { get; set; } = string.Empty;
    /// <summary>ACTIVE or ARCHIVED (deleted from the framework; kept for courses of retired versions and the audit log).</summary>
    public string Status { get; set; } = Statuses.PlatformFrameworkDomain.Active;
}

/// <summary>
/// Table platform_framework_releases: one published version of a framework.
/// Snapshot is a JSON array of { code, name, description } (jsonb column).
/// </summary>
public class PlatformFrameworkRelease : BaseEntity
{
    public Guid FrameworkId { get; set; }
    public int VersionNo { get; set; }
    public string Snapshot { get; set; } = "[]";
    public string? ReleaseNote { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}
