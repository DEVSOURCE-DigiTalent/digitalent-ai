namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCatalogCourseUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    /// <summary>Only for a course never published; ignored when null.</summary>
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Outcome { get; set; }
    public Guid DomainId { get; set; }
    public int Level { get; set; } = 1;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = "OPEN";
}
