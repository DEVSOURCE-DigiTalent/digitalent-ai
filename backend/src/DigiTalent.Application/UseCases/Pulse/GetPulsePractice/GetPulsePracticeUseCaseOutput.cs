namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulsePracticeUseCaseOutput
{
    public List<PulsePracticeItemDto> Finals { get; set; } = new();
    /// <summary>Bài đánh giá trước khi học đã nộp (chờ chấm trước, rồi mới nhất).</summary>
    public List<PulsePracticeItemDto> PreAssessments { get; set; } = new();
    public List<PulseCriterionDto> Criteria { get; set; } = new();
}

public class PulsePracticeItemDto
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    public DateTimeOffset? LastSubmittedAt { get; set; }
    public string? LastDecision { get; set; }
    public string? LastDecisionReason { get; set; }
    public DateTimeOffset? LastReviewedAt { get; set; }
    public DateTimeOffset? RetryOpensAt { get; set; }
    public DateTimeOffset? RetryDueAt { get; set; }
    public string? SupportAction { get; set; }
}
