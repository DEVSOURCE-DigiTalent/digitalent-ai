namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Member detail (OW-03): the list row plus direct manager and the latest audit entries about the member.
/// </summary>
public class GetMemberByIdUseCaseOutput : MemberListItem
{
    public Guid? DirectManagerId { get; set; }
    public string? DirectManagerName { get; set; }
    public List<MemberHistoryEntry> History { get; set; } = new();
}

/// <summary>
/// One audit entry (frontend MemberHistoryEntry).
/// </summary>
public class MemberHistoryEntry
{
    public Guid Id { get; set; }
    public DateTimeOffset At { get; set; }
    public string? ActorName { get; set; } // null = system
    public string Action { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string TargetLabel { get; set; } = string.Empty;
}
