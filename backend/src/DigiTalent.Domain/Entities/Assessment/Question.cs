using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng questions. Câu hỏi.
/// </summary>
public class Question : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = string.Empty;
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    /// <summary>Câu của bài trắc nghiệm cuối khóa trong giáo trình (chép từ catalog nền tảng), không phải câu ôn tập module.</summary>
    public bool IsFinalQuiz { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
