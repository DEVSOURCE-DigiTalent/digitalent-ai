using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// One standard course as Platform Admin sees it: published fields, pending draft and seat totals.
/// </summary>
public class PlatformCourseItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DomainCode { get; set; } = string.Empty;
    public string DomainName { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public int VersionNo { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public bool IsFree => Level == PlatformCatalog.MinLevel;
    public bool HasDraft { get; set; }
    public PlatformCourseDraft? Draft { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public int PublishedQuestionCount { get; set; }
    public int DraftQuestionCount { get; set; }
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
    public long Revenue { get; set; }
}
