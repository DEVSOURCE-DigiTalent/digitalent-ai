namespace DigiTalent.Application.UseCases.Platform.Framework;

public class PlatformFrameworkDomainItem
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string PublishedDescription { get; set; } = string.Empty;
    public string DraftDescription { get; set; } = string.Empty;
    public bool HasDraft => DraftDescription != PublishedDescription;
}
