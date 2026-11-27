using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng proctoring_behavior_reports (canonical v3.10). Báo cáo hành vi của một phiên làm bài cuối khóa có giám sát, lập
/// khi nhân viên nộp bài: phần tổng hợp từ nhật ký giám sát (điểm rủi ro, các đoạn đáng ngờ) được lưu ngay, AI phân tích
/// nhật ký sau đó ở nền (Status PENDING → READY, hoặc FAILED kèm ErrorCode). Mỗi phiên một báo cáo; phân tích lại ghi đè.
/// Video không được gửi cho AI — chỉ nhật ký sự kiện (loại, thời điểm, thời lượng, số ký tự sao chép / dán).
/// </summary>
public class ProctoringBehaviorReport : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid SessionId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid? CourseId { get; set; }
    /// <summary>Lần nộp bài cuối khóa của phiên.</summary>
    public Guid? FinalSubmissionId { get; set; }
    /// <summary>PENDING | READY | FAILED.</summary>
    public string Status { get; set; } = string.Empty;
    /// <summary>Điểm rủi ro 0–100 tổng hợp từ nhật ký (luật cố định, không cần AI).</summary>
    public short RiskScore { get; set; }
    /// <summary>LOW | MEDIUM | HIGH theo <see cref="RiskScore"/>.</summary>
    public string RiskLevel { get; set; } = string.Empty;
    /// <summary>Kết luận của AI (LOW | MEDIUM | HIGH); null khi AI chưa phân tích xong.</summary>
    public string? AiLevel { get; set; }
    /// <summary>Tóm tắt của AI.</summary>
    public string? Summary { get; set; }
    /// <summary>
    /// Nội dung báo cáo (jsonb): phần tổng hợp từ nhật ký (điểm, yếu tố, đoạn đáng ngờ), số liệu của bài (độ dài bài tự
    /// luận, số ký tự dán…) và kết quả AI (các phát hiện kèm sự kiện làm bằng chứng, lời khuyên).
    /// </summary>
    public string Details { get; set; } = "{}";
    /// <summary>AI_NOT_CONFIGURED | AI_UNAVAILABLE | AI_INVALID_ANSWER khi Status = FAILED.</summary>
    public string? ErrorCode { get; set; }
    public string? Model { get; set; }
    /// <summary>SHA-256 (hex) của dữ liệu đã gửi cho AI ở lần phân tích gần nhất.</summary>
    public string? InputHash { get; set; }
    /// <summary>Số lần đã gọi AI cho báo cáo này.</summary>
    public short AttemptCount { get; set; }
    public DateTimeOffset? AnalyzedAt { get; set; }
}
