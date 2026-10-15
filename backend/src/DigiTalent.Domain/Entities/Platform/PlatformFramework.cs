using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_framework_domains: one of the six domains of the Digital AI standard (the outer ceiling).
/// Platform Admin edits the draft description and publishes it as a new framework version.
/// </summary>
public class PlatformFrameworkDomain : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string PublishedDescription { get; set; } = string.Empty;
    public string DraftDescription { get; set; } = string.Empty;
}

/// <summary>
/// Table platform_framework_releases: one published version of the six-domain standard.
/// Snapshot is a JSON array of { code, name, description } (jsonb column).
/// </summary>
public class PlatformFrameworkRelease : BaseEntity
{
    public int VersionNo { get; set; }
    public string Snapshot { get; set; } = "[]";
    public string? ReleaseNote { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}
