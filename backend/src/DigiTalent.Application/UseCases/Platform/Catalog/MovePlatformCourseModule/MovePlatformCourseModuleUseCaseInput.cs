namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class MovePlatformCourseModuleUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    public int ToIndex { get; set; }
}
