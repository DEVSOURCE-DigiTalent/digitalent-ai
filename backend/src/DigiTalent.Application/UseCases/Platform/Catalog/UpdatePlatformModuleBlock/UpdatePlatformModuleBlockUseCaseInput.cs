namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformModuleBlockUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid BlockId { get; set; }
    /// <summary>TEXT blocks: rich text (sanitized before it is stored).</summary>
    public string? BodyHtml { get; set; }
    /// <summary>IMAGE / VIDEO blocks: an uploaded asset of the same kind.</summary>
    public Guid? AssetId { get; set; }
    public string? Caption { get; set; }
    public string? AltText { get; set; }
    /// <summary>SLIDE blocks: the whole ordered list of images and videos.</summary>
    public List<PlatformSlideItemInput>? Items { get; set; }
}
