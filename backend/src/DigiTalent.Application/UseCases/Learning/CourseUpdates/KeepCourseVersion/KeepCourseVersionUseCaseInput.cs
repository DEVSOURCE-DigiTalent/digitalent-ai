namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

public class KeepCourseVersionUseCaseInput
{
    /// <summary>The newest published version the organization does not apply.</summary>
    public int VersionNo { get; set; }

    public string Reason { get; set; } = string.Empty;
}
