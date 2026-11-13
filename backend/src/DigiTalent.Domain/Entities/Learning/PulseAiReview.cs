using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng pulse_ai_reviews (canonical v3.7). Gợi ý chấm của AI cho một bài nộp mà người chấm đang xem: bài cuối khóa
/// (<see cref="CourseFinalSubmission"/>, kind FINAL) hoặc bài đánh giá trước khi học (<see cref="CoursePreAssessment"/>,
/// kind PRE_ASSESSMENT). Mỗi bài nộp có một dòng; <see cref="InputHash"/> đổi (đề, tiêu chí, nội dung khóa hay nhật ký
/// giám sát đã khác) thì AI chấm lại và ghi đè. Chỉ kết quả của AI được lưu — gợi ý dò từ khóa khi AI không khả dụng
/// thì không, để lần mở sau thử AI lại.
/// </summary>
public class PulseAiReview : BaseEntity
{
    public Guid OrganizationId { get; set; }
    /// <summary><c>FINAL</c> hoặc <c>PRE_ASSESSMENT</c> (giống <c>proctoring_sessions.kind</c>).</summary>
    public string SubmissionKind { get; set; } = string.Empty;
    /// <summary>Id của course_final_submissions hoặc course_pre_assessments, theo <see cref="SubmissionKind"/>.</summary>
    public Guid SubmissionId { get; set; }
    /// <summary>SHA-256 (hex) của mọi dữ liệu đã gửi cho AI.</summary>
    public string InputHash { get; set; } = string.Empty;
    /// <summary>Kết quả đầy đủ (jsonb): từng tiêu chí, tóm tắt, điểm chi tiết, nhận định gian lận.</summary>
    public string Result { get; set; } = "{}";
    public string? Model { get; set; }
}
