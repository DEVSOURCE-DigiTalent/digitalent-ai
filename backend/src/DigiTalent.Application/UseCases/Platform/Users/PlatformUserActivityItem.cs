namespace DigiTalent.Application.UseCases.Platform.Users;

public class PlatformUserActivityItem
{
    public string Action { get; set; } = string.Empty;
    public string? EntityLabel { get; set; }
    public string? NewValues { get; set; }
    public string? ActorEmail { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
