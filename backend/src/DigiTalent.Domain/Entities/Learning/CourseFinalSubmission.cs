using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_final_submissions. Một lần nộp bài cuối khóa (ghi chú minh chứng), tối đa 2 lần mỗi lượt học.
/// Decision = null là đang chờ quản lý phòng ban chấm. Lần 1 chưa đạt mở lần nộp cuối trong cửa sổ
/// RetryOpensAt → RetryDueAt (chụp chính sách lúc chấm); lần 2 chưa đạt là cờ cần hỗ trợ (Support*).
/// ProctoringSessionId: phiên làm bài có giám sát (v3.3), null với bài nộp trước khi có giám sát.
/// ChoiceScore / ChoiceTotal: số câu trắc nghiệm đúng / số câu của đề (v3.3 §20.6), null với bài nộp trước khi có trắc nghiệm.
/// </summary>
public class CourseFinalSubmission : BaseEntity
{
    public Guid EnrollmentId { get; set; }
    public Guid? ProctoringSessionId { get; set; }
    public short AttemptNo { get; set; }
    public string EvidenceText { get; set; } = string.Empty;
    public short? ChoiceScore { get; set; }
    public short? ChoiceTotal { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset? RetryOpensAt { get; set; }
    public DateTimeOffset? RetryDueAt { get; set; }
    public string? SupportAction { get; set; }
    public string? SupportNote { get; set; }
    public Guid? SupportRecordedByUserId { get; set; }
    public DateTimeOffset? SupportRecordedAt { get; set; }
}
