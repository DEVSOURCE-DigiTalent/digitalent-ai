namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Raw activation token from the URL.
/// </summary>
public class GetInvitationUseCaseInput
{
    public string Token { get; set; } = string.Empty;
}
