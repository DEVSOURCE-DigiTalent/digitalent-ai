namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulsePreAssessmentUseCaseOutput
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    public PulseDomainDto Domain { get; set; } = new();
    public string? PositionName { get; set; }
    public PulseReviewerDto? Reviewer { get; set; }
    public List<PulseCriterionDto> Criteria { get; set; } = new();
    /// <summary>REQUIRED | LOCKED | PENDING | PASSED | NOT_YET | NOT_NEEDED — xem PulsePreStatus.</summary>
    public string Status { get; set; } = string.Empty;
    public bool CanStart { get; set; }
    /// <summary>Vì sao chưa làm được bài (null khi làm được).</summary>
    public string? ClosedMessage { get; set; }
    public PulsePreAssessmentSubmissionDto? Submission { get; set; }
}

public class PulsePreAssessmentSubmissionDto
{
    public Guid PreAssessmentId { get; set; }
    public string EvidenceText { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>PASSED | NOT_YET | null (chờ chấm).</summary>
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public string? ReviewerName { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? ProctoringSessionId { get; set; }
}
