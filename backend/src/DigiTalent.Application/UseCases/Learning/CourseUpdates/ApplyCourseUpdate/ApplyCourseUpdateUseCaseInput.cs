namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

public class ApplyCourseUpdateUseCaseInput
{
    /// <summary>The newest published version (the organization only moves forward; going back is the admin's).</summary>
    public int VersionNo { get; set; }

    /// <summary>0 = employees learning a changed course move to the new content at once; 7 / 14 / 30 = days to finish the old one.</summary>
    public int GraceDays { get; set; } = CourseRelearn.DefaultGraceDays;

    /// <summary>A major change (the old content is wrong now): employees who finished a changed course learn it again.</summary>
    public bool MajorChange { get; set; }
}
