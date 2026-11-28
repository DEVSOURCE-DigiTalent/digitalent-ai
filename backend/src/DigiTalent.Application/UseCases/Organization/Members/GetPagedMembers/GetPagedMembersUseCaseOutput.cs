using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Page of <see cref="MemberListItem"/> (members first, pending invitations last), with the counts of the whole
/// organization the owner acts on (OW-02 "Cần xử lý"), whatever the filters.
/// </summary>
public class GetPagedMembersUseCaseOutput : PagedList<MemberListItem>
{
    public MemberSummary Summary { get; set; } = new();
}

/// <summary>Counts over every member and pending invitation of the organization (filters ignored).</summary>
public class MemberSummary
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Pending { get; set; }
    public int Inactive { get; set; }

    /// <summary>Active people with an employee profile and no position (<see cref="MemberRules.HasNoPosition"/>).</summary>
    public int WithoutPosition { get; set; }
}
