namespace DigiTalent.Application.UseCases.Platform.Framework;

public class PublishPlatformFrameworkUseCaseInput
{
    public Guid FrameworkId { get; set; }
    public string? ReleaseNote { get; set; }
}
