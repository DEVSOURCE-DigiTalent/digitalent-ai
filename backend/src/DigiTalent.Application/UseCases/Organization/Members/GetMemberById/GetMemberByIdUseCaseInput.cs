namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Id from the URL: user id, employee id (profile without account) or invitation id, as returned by the list.
/// </summary>
public class GetMemberByIdUseCaseInput
{
    public Guid Id { get; set; }
}
