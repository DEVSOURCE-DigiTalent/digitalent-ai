namespace DigiTalent.Application.UseCases.Platform.Users;

public class PlatformUserDetailOutput
{
    public PlatformUserItem User { get; set; } = new();
    public string? OrganizationStatus { get; set; }
    public List<PlatformUserActivityItem> SupportHistory { get; set; } = new();
}
