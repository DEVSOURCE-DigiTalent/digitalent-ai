namespace DigiTalent.Application.UseCases.Me;

public class SubmitMyTaskUseCaseOutput
{
    public Guid AssignmentId { get; set; }
    public Guid SubmissionId { get; set; }
    public int VersionNo { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string AssignmentStatus { get; set; } = string.Empty;
}
