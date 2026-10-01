namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng lesson_learning_outcomes. Bài học này phục vụ chuẩn đầu ra nào.
/// Bảng nối chỉ có 2 cột khóa nên phải viết tay (scaffold không sinh ra).
/// </summary>
public class LessonLearningOutcome
{
    public Guid LessonId { get; set; }
    public Guid LearningOutcomeId { get; set; }
}
