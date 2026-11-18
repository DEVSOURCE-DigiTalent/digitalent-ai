using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// One published course as Platform Admin sees it: the fields of the catalog version in use, its price in the
/// draft version (if any), content size, and how many organizations bought it.
/// </summary>
public class PlatformCourseItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public string DomainCode { get; set; } = string.Empty;
    public string DomainName { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
    /// <summary>Catalog version in use.</summary>
    public int VersionNo { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long Price { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public bool IsFree => Level == PlatformCatalog.MinLevel;
    /// <summary>Price of the course in the draft version; null when there is no draft.</summary>
    public long? DraftPrice { get; set; }
    /// <summary>Sales status of the course in the draft version; null when there is no draft.</summary>
    public string? DraftSalesStatus { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public int ModuleCount { get; set; }
    public int QuestionCount { get; set; }
    /// <summary>Organizations that bought the course.</summary>
    public int PurchaseCount { get; set; }
    public long Revenue { get; set; }
}
