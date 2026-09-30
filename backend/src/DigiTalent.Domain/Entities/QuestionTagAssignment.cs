namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng question_tag_assignments. Gán 1 câu hỏi vào N nhãn (question_tags).
/// </summary>
public class QuestionTagAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public Guid TagId { get; set; }
}
