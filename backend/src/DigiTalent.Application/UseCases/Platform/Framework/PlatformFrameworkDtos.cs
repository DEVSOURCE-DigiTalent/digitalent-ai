namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>A framework in the list: status, version and how many courses it has in the catalog version in use.</summary>
public class PlatformFrameworkSummary
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>Published framework version; 0 = never published.</summary>
    public int CurrentVersionNo { get; set; }
    public int DomainCount { get; set; }
    /// <summary>Courses of the framework in the catalog version in use.</summary>
    public int CourseCount { get; set; }
    /// <summary>Courses in use by level: [Basic, Intermediate, Advanced].</summary>
    public int[] CoursesByLevel { get; set; } = new int[3];
    /// <summary>Courses of the framework in the draft catalog version; null when there is no draft.</summary>
    public int? DraftCourseCount { get; set; }
    /// <summary>A domain description differs from its published text.</summary>
    public bool HasDraft { get; set; }
}

public class PlatformFrameworksOutput
{
    public List<PlatformFrameworkSummary> Items { get; set; } = new();
    public int? CurrentCatalogVersionNo { get; set; }
    public int? DraftCatalogVersionNo { get; set; }
}

public class PlatformFrameworkDetail : PlatformFrameworkSummary
{
    public int? CurrentCatalogVersionNo { get; set; }
    public int? DraftCatalogVersionNo { get; set; }
    public List<PlatformFrameworkDomainItem> Domains { get; set; } = new();
    public List<PlatformFrameworkReleaseItem> Releases { get; set; } = new();
}

public class PlatformFrameworkDomainItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string PublishedDescription { get; set; } = string.Empty;
    public string DraftDescription { get; set; } = string.Empty;
    public bool HasDraft => DraftDescription != PublishedDescription;
    /// <summary>Courses of the domain in the catalog version in use.</summary>
    public List<PlatformFrameworkCourseRef> Courses { get; set; } = new();
    /// <summary>Courses added to the domain in the draft catalog version.</summary>
    public List<PlatformFrameworkCourseRef> DraftNewCourses { get; set; } = new();
}

public class PlatformFrameworkCourseRef
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
}

public class PlatformFrameworkReleaseItem
{
    public int VersionNo { get; set; }
    public string? ReleaseNote { get; set; }
    public string? PublishedByEmail { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}
