using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_evaluation_results. Kết quả đánh giá từng năng lực trong 1 lần chấm bài.
/// </summary>
public class CompetencyEvaluationResult : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskEvaluationId { get; set; }
    public Guid CompetencyId { get; set; }
    public short TargetLevel { get; set; }
    public decimal? Score { get; set; }
    public string Verdict { get; set; } = string.Empty;
    public bool LevelConfirming { get; set; }
    public short? ConfirmedLevel { get; set; }
    public string? Feedback { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
