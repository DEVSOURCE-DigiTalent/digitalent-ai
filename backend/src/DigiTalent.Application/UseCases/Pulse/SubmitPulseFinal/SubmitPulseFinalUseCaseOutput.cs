namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseFinalUseCaseOutput
{
    public Guid SubmissionId { get; set; }
    public int AttemptNo { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>Luôn PENDING — chờ quản lý phòng ban quyết định.</summary>
    public string Status { get; set; } = PulseFinalStatus.Pending;
}
