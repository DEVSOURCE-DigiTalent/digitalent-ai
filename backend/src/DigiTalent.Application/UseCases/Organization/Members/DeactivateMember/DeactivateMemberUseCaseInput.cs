using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Organization.Members;

public class DeactivateMemberUseCaseInput
{
    // Id comes from the URL (POST api/v1/members/{id}/deactivate)
    [JsonIgnore]
    public Guid Id { get; set; }

    /// <summary>Why the member leaves; shown on the member detail and kept in the audit log.</summary>
    public string Reason { get; set; } = string.Empty;
}
