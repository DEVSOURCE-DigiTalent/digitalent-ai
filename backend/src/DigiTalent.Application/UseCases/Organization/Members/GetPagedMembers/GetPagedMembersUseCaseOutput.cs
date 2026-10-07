using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Page of <see cref="MemberListItem"/> (members first, pending invitations last).
/// </summary>
public class GetPagedMembersUseCaseOutput : PagedList<MemberListItem>
{
}
