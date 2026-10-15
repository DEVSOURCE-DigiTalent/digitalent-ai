namespace DigiTalent.Application.UseCases.Platform.Framework;

public class AddPlatformFrameworkDomainUseCaseInput
{
    public Guid FrameworkId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
