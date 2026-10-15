namespace DigiTalent.Application.UseCases.Platform.Framework;

public class SavePlatformFrameworkDraftUseCaseInput
{
    public Guid FrameworkId { get; set; }
    public List<PlatformFrameworkDomainDraftInput> Domains { get; set; } = new();
}

public class PlatformFrameworkDomainDraftInput
{
    public Guid DomainId { get; set; }
    public string Description { get; set; } = string.Empty;
}
