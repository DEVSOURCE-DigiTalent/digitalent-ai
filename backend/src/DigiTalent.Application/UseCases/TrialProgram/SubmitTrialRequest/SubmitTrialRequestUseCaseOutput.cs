namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitTrialRequestUseCaseOutput
{
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset TestDeadline { get; set; }
    public DateTimeOffset PreferredReviewAt { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
}
