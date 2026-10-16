namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseRecordingContentUseCaseInput
{
    public Guid RecordingId { get; set; }

    /// <summary>Hạn của link (Unix giây).</summary>
    public long ExpiresAt { get; set; }

    public string? Signature { get; set; }
}
