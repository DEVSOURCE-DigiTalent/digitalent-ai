using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng assessment_answers. Câu trả lời trong 1 lượt làm bài.
/// </summary>
public class AssessmentAnswer : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
    public bool? IsCorrect { get; set; }
    public decimal? PointsAwarded { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
