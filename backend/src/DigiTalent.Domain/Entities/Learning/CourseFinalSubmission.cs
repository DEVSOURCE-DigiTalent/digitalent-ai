using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_final_submissions. Một lần nộp bài cuối khóa (ghi chú minh chứng), tối đa 2 lần mỗi lượt học.
/// Decision = null là đang chờ quản lý phòng ban chấm. Lần 1 chưa đạt mở lần nộp cuối trong cửa sổ
/// RetryOpensAt → RetryDueAt (chụp chính sách lúc chấm); lần 2 chưa đạt là cờ cần hỗ trợ (Support*).
/// </summary>
public class CourseFinalSubmission : BaseEntity
{
    public Guid EnrollmentId { get; set; }
    public short AttemptNo { get; set; }
    public string EvidenceText { get; set; } = string.Empty;
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
