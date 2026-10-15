namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class AddPlatformCourseModuleUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
}
