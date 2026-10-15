using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class ChangePlatformOrganizationStatusUseCaseInput
{
    [JsonIgnore]
    public Guid OrganizationId { get; set; }

    /// <summary>true = suspend, false = restore. Set from the route.</summary>
    [JsonIgnore]
    public bool Suspend { get; set; }

    public string Reason { get; set; } = string.Empty;
}
