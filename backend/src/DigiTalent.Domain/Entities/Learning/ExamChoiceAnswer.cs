using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng exam_choice_answers (canonical v3.3 §20.7). Câu trả lời trắc nghiệm của một bài làm có giám sát: thuộc đúng một
/// lần nộp bài cuối khóa (FinalSubmissionId) hoặc một bài đánh giá trước khi học (PreAssessmentId). Chấm tự động lúc nộp;
/// nhân viên chỉ thấy kết quả sau khi người chấm quyết định.
/// </summary>
public class ExamChoiceAnswer : BaseEntity
{
    public Guid? FinalSubmissionId { get; set; }
    public Guid? PreAssessmentId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid SelectedOptionId { get; set; }
    public bool IsCorrect { get; set; }
    /// <summary>Số thứ tự của câu trong đề (1-based).</summary>
    public short SortOrder { get; set; }
}
