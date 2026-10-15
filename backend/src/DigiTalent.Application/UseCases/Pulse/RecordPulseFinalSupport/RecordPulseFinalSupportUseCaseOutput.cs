namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseFinalSupportUseCaseOutput
{
    public Guid SubmissionId { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTimeOffset RecordedAt { get; set; }
}
