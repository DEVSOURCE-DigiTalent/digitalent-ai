namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulsePracticeUseCaseOutput
{
    public List<PulsePracticeItemDto> Finals { get; set; } = new();
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
