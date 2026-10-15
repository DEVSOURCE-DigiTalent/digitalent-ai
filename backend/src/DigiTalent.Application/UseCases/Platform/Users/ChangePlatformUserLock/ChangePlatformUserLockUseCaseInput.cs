using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class ChangePlatformUserLockUseCaseInput
{
    [JsonIgnore]
    public Guid UserId { get; set; }

    /// <summary>true = lock, false = unlock. Set from the route.</summary>
    [JsonIgnore]
    public bool Lock { get; set; }

    public string Reason { get; set; } = string.Empty;
}
