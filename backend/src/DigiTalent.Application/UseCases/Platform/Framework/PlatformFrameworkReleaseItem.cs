namespace DigiTalent.Application.UseCases.Platform.Framework;

public class PlatformFrameworkReleaseItem
{
    public int VersionNo { get; set; }
    public string? ReleaseNote { get; set; }
    public string? PublishedByEmail { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}
