namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class MovePlatformModuleBlockUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid BlockId { get; set; }
    public int ToIndex { get; set; }
}
