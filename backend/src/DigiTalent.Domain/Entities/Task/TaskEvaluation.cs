using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng task_evaluations. Kết quả chấm bài nộp.
/// </summary>
public class TaskEvaluation : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskSubmissionId { get; set; }
    public Guid ReviewerUserId { get; set; }
    public decimal? OverallScore { get; set; }
    public string Verdict { get; set; } = string.Empty;
    public bool CountsAsEvidence { get; set; }
    public string? Feedback { get; set; }
    public DateTimeOffset EvaluatedAt { get; set; }
    public Guid? FinalizationKey { get; set; }
    public long RowVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
