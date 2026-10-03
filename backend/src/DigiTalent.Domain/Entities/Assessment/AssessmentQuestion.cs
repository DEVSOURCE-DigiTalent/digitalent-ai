namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng assessment_questions. Câu hỏi trong bài kiểm tra, kèm điểm.
/// </summary>
public class AssessmentQuestion
{
    public Guid AssessmentId { get; set; }
    public Guid QuestionId { get; set; }
    public decimal Points { get; set; }
    public int SortOrder { get; set; }
}
