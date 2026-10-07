namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Invitation id from the URL (the member list returns it as the row id).
/// </summary>
public class ResendInvitationUseCaseInput
{
    public Guid Id { get; set; }
}
