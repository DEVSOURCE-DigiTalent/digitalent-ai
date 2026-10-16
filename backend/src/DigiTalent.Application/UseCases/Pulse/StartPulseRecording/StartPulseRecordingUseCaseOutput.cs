namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseRecordingUseCaseOutput
{
    public Guid RecordingId { get; set; }
    public string Track { get; set; } = string.Empty;
    public int SegmentNo { get; set; }
}
