namespace DigiTalent.Application.UseCases.Platform.Framework;

public class SavePlatformFrameworkDraftUseCaseInput
{
    public List<PlatformFrameworkDomainDraftInput> Domains { get; set; } = new();
}
