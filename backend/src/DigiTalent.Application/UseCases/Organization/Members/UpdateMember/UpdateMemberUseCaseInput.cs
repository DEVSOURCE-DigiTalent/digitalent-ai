using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Partial update of a member (OW-03, OW-13): send only what changes.
/// </summary>
public class UpdateMemberUseCaseInput
{
    // Id comes from the URL (PUT api/v1/members/{id})
    [JsonIgnore]
    public Guid Id { get; set; }

    /// <summary>New enterprise roles (OWNER / MANAGER / EMPLOYEE); null = unchanged. Needs role.assign_business.</summary>
    public List<string>? Roles { get; set; }

    /// <summary>New department; null = unchanged. Creates the employee profile if the member has none yet.</summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>
    /// New position: null = unchanged, "" = remove the position, a GUID = assign it.
    /// Kept as a string because the frontend sends "" to clear the field.
    /// </summary>
    public string? JobPositionId { get; set; }
}
