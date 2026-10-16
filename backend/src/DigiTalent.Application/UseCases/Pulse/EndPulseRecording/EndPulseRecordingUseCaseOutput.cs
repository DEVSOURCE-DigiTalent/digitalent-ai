namespace DigiTalent.Application.UseCases.Pulse;

public class EndPulseRecordingUseCaseOutput
{
    public Guid RecordingId { get; set; }
    public long StartOffsetMs { get; set; }
    public long EndOffsetMs { get; set; }
}
