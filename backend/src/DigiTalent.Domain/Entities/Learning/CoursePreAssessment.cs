using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_pre_assessments (canonical v3.3 §20.4). Bài đánh giá trước khi học của một nhân viên cho một khóa:
/// đề và tiêu chí như bài cuối khóa, làm một lần, có giám sát (ProctoringSessionId), quản lý phòng ban chấm.
/// Decision = null là đang chờ chấm. PASSED: khóa được công nhận — lượt học COMPLETED (EnrollmentId) và mở cấp kế tiếp.
/// NOT_YET: nhân viên học khóa rồi làm bài cuối khóa như bình thường.
/// </summary>
public class CoursePreAssessment : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public Guid? ProctoringSessionId { get; set; }
    public string EvidenceText { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? EnrollmentId { get; set; }
}
