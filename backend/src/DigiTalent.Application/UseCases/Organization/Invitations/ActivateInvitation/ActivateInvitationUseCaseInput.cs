namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Sent by the activation page (frontend types/commerce.ts ActivateInvitationInput).
/// </summary>
public class ActivateInvitationUseCaseInput
{
    public string Token { get; set; } = string.Empty;

    /// <summary>Name chosen by the invitee; empty = keep the name from the invitation.</summary>
    public string? FullName { get; set; }

    public string Password { get; set; } = string.Empty;
}
