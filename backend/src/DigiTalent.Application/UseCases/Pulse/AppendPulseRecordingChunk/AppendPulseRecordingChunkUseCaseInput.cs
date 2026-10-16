namespace DigiTalent.Application.UseCases.Pulse;

public class AppendPulseRecordingChunkUseCaseInput
{
    public Guid SessionId { get; set; }
    public Guid RecordingId { get; set; }

    /// <summary>Thứ tự của mẩu trong đoạn ghi, từ 0.</summary>
    public int Seq { get; set; }

    /// <summary>Nội dung mẩu (thân request, application/octet-stream).</summary>
    public Stream Content { get; set; } = Stream.Null;
}
