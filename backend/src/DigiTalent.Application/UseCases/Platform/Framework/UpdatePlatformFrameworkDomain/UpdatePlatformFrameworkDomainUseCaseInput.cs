namespace DigiTalent.Application.UseCases.Platform.Framework;

public class UpdatePlatformFrameworkDomainUseCaseInput
{
    public Guid FrameworkId { get; set; }
    public Guid DomainId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>New draft description; null keeps the current draft.</summary>
    public string? Description { get; set; }
}
