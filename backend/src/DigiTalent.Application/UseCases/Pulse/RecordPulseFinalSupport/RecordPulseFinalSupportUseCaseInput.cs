namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseFinalSupportUseCaseInput
{
    public Guid SubmissionId { get; set; }

    /// <summary>COACHING (kèm cặp) | FRESH_CYCLE (đề xuất chu kỳ học mới) | PAUSE (tạm dừng lộ trình).</summary>
    public string Action { get; set; } = string.Empty;

    public string? Note { get; set; }
}
