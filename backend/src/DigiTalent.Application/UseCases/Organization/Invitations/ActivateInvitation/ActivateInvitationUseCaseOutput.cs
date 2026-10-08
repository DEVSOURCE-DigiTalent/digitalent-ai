namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// The new account; the activation page sends the invitee to sign in with this e-mail.
/// </summary>
public class ActivateInvitationUseCaseOutput
{
    public string Email { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid? EmployeeId { get; set; } // null when the organization had no active department
}
