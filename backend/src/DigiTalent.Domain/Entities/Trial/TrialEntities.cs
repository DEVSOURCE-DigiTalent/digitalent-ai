using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public sealed class TrialRegistration : BaseEntity
{
    public string Email { get; set; } = "";
    public string OrganizationName { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Industry { get; set; } = "";
    public string Size { get; set; } = "";
    public string Goal { get; set; } = "";
    public string TokenHash { get; set; } = "";
    public string? OtpHash { get; set; }
    public int OtpFailedAttempts { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid? OrganizationId { get; set; }
    public int Revision { get; set; }
}

public sealed class TrialWorkspace : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid OwnerUserId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? PositionId { get; set; }
    public string Industry { get; set; } = "";
    public string Size { get; set; } = "";
    public string Goal { get; set; } = "";
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public string PolicyJson { get; set; } = "";
    public string? BundleJson { get; set; }
    public DateTimeOffset? ResultsViewedAt { get; set; }
    public DateTimeOffset? ConversionRequestedAt { get; set; }
    public DateTimeOffset? ConvertedAt { get; set; }
    public string? ConversionReference { get; set; }
    public long Revision { get; set; }

    // Bài đánh giá tổng hợp (v3.7, docs/specs/2026-10-31-trial-ai-report-roadmap.md): chủ doanh nghiệp đặt hạn làm bài;
    // bài đóng (ReportPublishedAt) khi hết hạn, khi mọi người đã nộp hoặc khi chủ doanh nghiệp đóng sớm.
    // PreferredReviewAt / RequestNote không còn ghi (luồng mentor chấm cũ). Mentor được phân công chỉ chấm bài cuối khóa học thử.
    public DateTimeOffset? TestDeadline { get; set; }
    public DateTimeOffset? PreferredReviewAt { get; set; }
    public string? RequestNote { get; set; }
    public DateTimeOffset? RequestedAt { get; set; }
    public Guid? MentorUserId { get; set; }
    public DateTimeOffset? MentorAssignedAt { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
}

/// <summary>
/// Bảng trial_reports (v3.7): báo cáo tự tạo khi bài đánh giá dùng thử đóng, một dòng mỗi doanh nghiệp. Số liệu luôn tính lại
/// từ bài làm; bảng chỉ giữ gợi ý (ưu tiên + lý do mức tối đa, jsonb) do AI viết hoặc câu mẫu, và trạng thái của AI.
/// </summary>
public sealed class TrialReport : BaseEntity
{
    public Guid OrganizationId { get; set; }
    /// <summary>Số bài đã dùng để viết gợi ý — bài nộp muộn làm đổi số này thì gợi ý được viết lại.</summary>
    public short AssessedCount { get; set; }
    public string Insights { get; set; } = "{}";
    /// <summary>PENDING | DONE | FALLBACK (Statuses.TrialReportAi).</summary>
    public string AiStatus { get; set; } = "PENDING";
    public string? AiModel { get; set; }
    /// <summary>Số câu AI bị rào chắn thay bằng câu mẫu ở lần viết gần nhất.</summary>
    public short AiReplaced { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public DateTimeOffset? AiCompletedAt { get; set; }
    /// <summary>xmin của PostgreSQL: lần viết AI bị bỏ khi báo cáo vừa được đặt lại.</summary>
    public uint Version { get; set; }
}

public sealed class TrialInvitation : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid PositionId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "Employee";
    public string TokenHash { get; set; } = "";
    public DateTimeOffset SentAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public Guid? EmployeeId { get; set; }
    public bool SendFailed { get; set; }
    public int SendCount { get; set; }
}

public sealed class PositionDiagnosticAttempt : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid PositionId { get; set; }
    public string BundleJson { get; set; } = "";
    public string AnswersJson { get; set; } = "[]";
    public int AnswerRevision { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public string? ResultJson { get; set; }
    public string? PathJson { get; set; }
    public DateTimeOffset? PathViewedAt { get; set; }
}

/// <summary>
/// Bảng trial_assessments (v3.5, v3.7): bài đánh giá tổng hợp của một nhân viên doanh nghiệp dùng thử — trắc nghiệm của cả ba
/// cấp (Cơ bản, Trung cấp, Nâng cao) cho mọi lĩnh vực, làm trong phòng thi có giám sát, máy chấm khi nộp. Một bài cho mỗi
/// nhân viên. Các cột tự luận / chấm của mentor (luồng cũ) giữ dữ liệu cũ, bài mới không ghi.
/// </summary>
public sealed class TrialAssessment : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid ProctoringSessionId { get; set; }
    public string EssayBasic { get; set; } = "";
    public string EssayIntermediate { get; set; } = "";
    public string EssayAdvanced { get; set; } = "";
    public short ChoiceScore { get; set; }
    public short ChoiceTotal { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewNote { get; set; }

    /// <summary>Điểm mentor cho từng bài tự luận (0–10, đạt từ 5), NULL khi chưa chấm.</summary>
    public short? EssayBasicScore { get; set; }
    public short? EssayIntermediateScore { get; set; }
    public short? EssayAdvancedScore { get; set; }

    /// <summary>Gợi ý chấm tự luận của AI ở luồng mentor cũ (jsonb) — không còn ghi.</summary>
    public string? AiEssayReview { get; set; }
    public DateTimeOffset? AiEssayReviewedAt { get; set; }
}

/// <summary>
/// Bảng trial_assessment_domains (v3.5): kết quả của một lĩnh vực trong bài đánh giá tổng hợp — số câu đúng theo cấp,
/// mức gợi ý từ trắc nghiệm (cấp cao nhất đúng liên tiếp từ Cơ bản) và mức mentor quyết định (0 = chưa đạt Cơ bản).
/// </summary>
public sealed class TrialAssessmentDomain : BaseEntity
{
    public Guid TrialAssessmentId { get; set; }
    public Guid CategoryId { get; set; }
    public short BasicCorrect { get; set; }
    public short BasicTotal { get; set; }
    public short IntermediateCorrect { get; set; }
    public short IntermediateTotal { get; set; }
    public short AdvancedCorrect { get; set; }
    public short AdvancedTotal { get; set; }
    public short SuggestedLevel { get; set; }
    public short? MentorLevel { get; set; }
}
