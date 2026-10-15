namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseOutcomeUseCaseInput
{
    /// <summary>Mã bản ghi từ danh sách: "final-…", "cert-…" hoặc "task-…".</summary>
    public string OutcomeId { get; set; } = string.Empty;
}
