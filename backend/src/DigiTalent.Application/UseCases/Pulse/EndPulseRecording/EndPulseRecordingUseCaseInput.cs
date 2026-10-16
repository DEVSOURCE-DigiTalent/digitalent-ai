namespace DigiTalent.Application.UseCases.Pulse;

public class EndPulseRecordingUseCaseInput
{
    public Guid SessionId { get; set; }
    public Guid RecordingId { get; set; }

    /// <summary>Vị trí kết thúc của đoạn trên dòng thời gian phiên (ms).</summary>
    public long EndOffsetMs { get; set; }
}
