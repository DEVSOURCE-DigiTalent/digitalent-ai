using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// One published course as Platform Admin sees it: the fields of the catalog version in use, its price in the
/// draft version (if any), content size and seat totals.
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
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public bool IsFree => Level == PlatformCatalog.MinLevel;
    /// <summary>Price of the course in the draft version; null when there is no draft.</summary>
    public long? DraftPricePerSeat { get; set; }
    /// <summary>Sales status of the course in the draft version; null when there is no draft.</summary>
    public string? DraftSalesStatus { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public int ModuleCount { get; set; }
    public int QuestionCount { get; set; }
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
    public long Revenue { get; set; }
}
