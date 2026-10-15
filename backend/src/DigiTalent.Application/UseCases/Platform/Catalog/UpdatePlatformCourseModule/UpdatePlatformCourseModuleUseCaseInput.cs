namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCourseModuleUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? QuizTitle { get; set; }
}
