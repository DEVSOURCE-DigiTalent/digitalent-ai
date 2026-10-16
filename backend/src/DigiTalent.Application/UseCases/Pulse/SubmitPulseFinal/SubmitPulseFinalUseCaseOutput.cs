namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseFinalUseCaseOutput
{
    public Guid SubmissionId { get; set; }
    public int AttemptNo { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>Độ dài phiên làm bài (ms) — thời lượng bản ghi gửi cho người chấm.</summary>
    public long DurationMs { get; set; }
    /// <summary>Luôn PENDING — chờ người chấm quyết định.</summary>
    public string Status { get; set; } = PulseFinalStatus.Pending;
}
