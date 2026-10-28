namespace DigiTalent.Application.UseCases.TrialProgram;

public class ReviewTrialAssessmentUseCaseOutput
{
    public Guid AssessmentId { get; set; }
    public DateTimeOffset ReviewedAt { get; set; }
}
