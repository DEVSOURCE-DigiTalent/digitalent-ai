namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitMyTrialAssessmentUseCaseOutput
{
    public Guid AssessmentId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public long DurationMs { get; set; }
}
