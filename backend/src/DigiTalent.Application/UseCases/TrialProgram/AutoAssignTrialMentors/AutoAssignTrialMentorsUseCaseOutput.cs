namespace DigiTalent.Application.UseCases.TrialProgram;

public class AutoAssignTrialMentorsUseCaseOutput
{
    /// <summary>Organizations that just got a mentor.</summary>
    public List<AutoAssignedTrial> Assigned { get; set; } = new();

    /// <summary>Organizations still without a mentor because every mentor is full.</summary>
    public int Remaining { get; set; }
}

public class AutoAssignedTrial
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public Guid MentorUserId { get; set; }
    public string MentorName { get; set; } = string.Empty;
}
