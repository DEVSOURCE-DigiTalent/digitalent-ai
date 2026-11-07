namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitTrialRequestUseCaseOutput
{
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset TestDeadline { get; set; }
}
