namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseFinalReviewsUseCaseOutput
{
    /// <summary>Bài chờ quyết định (bài đánh giá trước khi học + bài cuối khóa).</summary>
    public int PendingCount { get; set; }
    /// <summary>Bài đánh giá trước khi học chờ quyết định.</summary>
    public int PreAssessmentCount { get; set; }
    public int RetryCount { get; set; }
    public int DeadlineMissedCount { get; set; }
    public int FlaggedCount { get; set; }
    public List<PulseCriterionDto> Criteria { get; set; } = new();
    public List<PulseFinalReviewItemDto> Items { get; set; } = new();
}

public class PulseFinalReviewItemDto
{
    public DigiTalent.Application.UseCases.Platform.Catalog.PlatformCourseFinalDto? Assignment { get; set; }
    /// <summary>PRE_ASSESSMENT (đánh giá trước khi học) | FINAL (bài cuối khóa).</summary>
    public string Kind { get; set; } = string.Empty;
    /// <summary>
    /// FINAL: lần nộp mới nhất — dùng cho POST {submissionId}/decision và /support.
    /// PRE_ASSESSMENT: id bài đánh giá — dùng cho POST pre-assessments/{id}/decision.
    /// </summary>
    public Guid SubmissionId { get; set; }
    /// <summary>PENDING | RETRY_WAIT | RETRY_READY | DEADLINE_MISSED | FLAGGED (bài đánh giá trước khi học luôn PENDING).</summary>
    public string Status { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    /// <summary>Doanh nghiệp của người làm bài (mentor chấm cho nhiều doanh nghiệp dùng thử).</summary>
    public string? OrganizationName { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string? DomainName { get; set; }
    public int? Tier { get; set; }
    public int AttemptNo { get; set; }
    public int MaxAttempts { get; set; }
    public List<PulseFinalAttemptDto> Attempts { get; set; } = new();
    /// <summary>Gợi ý AI minh họa cho bài đang chờ (chỉ tham khảo).</summary>
    public PulseAiHintDto? AiHint { get; set; }
    /// <summary>Phiên có giám sát của lần nộp mới nhất (null với bài nộp trước khi có giám sát).</summary>
    public Guid? ProctoringSessionId { get; set; }
    /// <summary>Bản ghi màn hình / camera và nhật ký giám sát của lần nộp mới nhất.</summary>
    public PulseRecordingDto? Recording { get; set; }
}
