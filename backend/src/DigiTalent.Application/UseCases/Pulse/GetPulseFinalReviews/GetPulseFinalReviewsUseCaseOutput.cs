namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseFinalReviewsUseCaseOutput
{
    public int PendingCount { get; set; }
    public int RetryCount { get; set; }
    public int DeadlineMissedCount { get; set; }
    public int FlaggedCount { get; set; }
    public List<PulseCriterionDto> Criteria { get; set; } = new();
    public List<PulseFinalReviewItemDto> Items { get; set; } = new();
}

public class PulseFinalReviewItemDto
{
    /// <summary>Lần nộp mới nhất — dùng cho POST decision / support.</summary>
    public Guid SubmissionId { get; set; }
    /// <summary>PENDING | RETRY_WAIT | RETRY_READY | DEADLINE_MISSED | FLAGGED.</summary>
    public string Status { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
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
    /// <summary>Gợi ý AI minh họa cho lần nộp đang chờ (chỉ tham khảo).</summary>
    public PulseAiHintDto? AiHint { get; set; }
}
