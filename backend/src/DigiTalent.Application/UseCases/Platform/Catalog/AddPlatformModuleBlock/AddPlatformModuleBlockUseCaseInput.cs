namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class AddPlatformModuleBlockUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    /// <summary>TEXT, SLIDE, IMAGE or VIDEO.</summary>
    public string Type { get; set; } = string.Empty;
    /// <summary>0-based position; null = at the end.</summary>
    public int? Position { get; set; }
}
