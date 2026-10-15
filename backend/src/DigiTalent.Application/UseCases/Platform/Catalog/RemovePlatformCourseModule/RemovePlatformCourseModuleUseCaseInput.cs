namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class RemovePlatformCourseModuleUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
}
