namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class RemovePlatformModuleBlockUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid BlockId { get; set; }
}
