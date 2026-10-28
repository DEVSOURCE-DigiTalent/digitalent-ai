using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng proctoring_sessions (canonical v3.3 §20.1, v3.5). Một lần làm bài có giám sát — đánh giá trước khi học hoặc bài
/// cuối khóa của một khóa, hoặc bài đánh giá tổng hợp dùng thử (TRIAL_ASSESSMENT, không có khóa) — của nhân viên: toàn bộ
/// màn hình, camera và micro được ghi thành các đoạn
/// (<see cref="ProctoringRecording"/>), các sự kiện được ghi vào <see cref="ProctoringEvent"/>.
/// Status RECORDING → SUBMITTED khi nộp bài, ABANDONED khi bỏ dở hoặc bắt đầu phiên mới.
/// </summary>
public class ProctoringSession : BaseEntity
{
    public Guid EmployeeId { get; set; }
    /// <summary>Khóa của bài; null với bài đánh giá tổng hợp dùng thử.</summary>
    public Guid? CourseId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? EndedAt { get; set; }
    public long? DurationMs { get; set; }
}
