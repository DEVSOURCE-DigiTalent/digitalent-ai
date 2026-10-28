namespace DigiTalent.Application.UseCases.TrialProgram;

public class AssignTrialMentorUseCaseOutput
{
    public Guid OrganizationId { get; set; }
    public Guid MentorUserId { get; set; }
    public string MentorName { get; set; } = string.Empty;
    public DateTimeOffset AssignedAt { get; set; }
}
