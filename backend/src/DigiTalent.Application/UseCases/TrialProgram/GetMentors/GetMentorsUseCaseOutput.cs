namespace DigiTalent.Application.UseCases.TrialProgram;

public class GetMentorsUseCaseOutput
{
    public List<MentorItem> Items { get; set; } = new();
}

public class MentorItem
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>Trial organizations assigned to the mentor that are not converted yet.</summary>
    public int ActiveTrials { get; set; }
    /// <summary>Course finals waiting for a decision in those organizations.</summary>
    public int WaitingFinals { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
