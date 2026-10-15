namespace DigiTalent.Application.UseCases.Platform.Courses;

public class PlatformCourseReleaseItem
{
    public int VersionNo { get; set; }
    public string Title { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public string? PublishedByEmail { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}
