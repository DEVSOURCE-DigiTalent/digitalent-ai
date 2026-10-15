namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>One platform course an organization's employees are enrolled in.</summary>
public class PlatformOrganizationCourseUsageItem
{
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public int Participants { get; set; }
    public int Completed { get; set; }
}
