namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>A paid course the organization bought (once, for every employee).</summary>
public class PlatformOrganizationPurchasedCourseItem
{
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string LevelName { get; set; } = string.Empty;
    public DateTimeOffset PurchasedAt { get; set; }
}
