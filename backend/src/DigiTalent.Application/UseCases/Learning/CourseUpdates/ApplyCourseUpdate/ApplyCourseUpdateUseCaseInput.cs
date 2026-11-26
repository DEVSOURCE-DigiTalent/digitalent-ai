namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

public class ApplyCourseUpdateUseCaseInput
{
    /// <summary>The newest published version (the organization only moves forward; going back is the admin's).</summary>
    public int VersionNo { get; set; }
}
