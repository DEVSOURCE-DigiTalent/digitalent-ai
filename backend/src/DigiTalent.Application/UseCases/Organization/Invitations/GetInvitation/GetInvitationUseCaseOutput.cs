namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// What the activation page shows (frontend types/commerce.ts InvitationDetail).
/// </summary>
public class GetInvitationUseCaseOutput
{
    public string OrganizationName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // OWNER | MANAGER | EMPLOYEE
    public string Status { get; set; } = "pending";
    public DateTimeOffset ExpiresAt { get; set; }
}
