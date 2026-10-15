namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class CreatePlatformCatalogCourseUseCaseInput
{
    public int VersionNo { get; set; }
    /// <summary>Upper-case letters, digits and dashes, e.g. AI1-F.</summary>
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid DomainId { get; set; }
    public int Level { get; set; } = 1;
}
