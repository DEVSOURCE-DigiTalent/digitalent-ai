namespace DigiTalent.Application.UseCases.Me;

public class GetMyAssessmentByIdUseCaseOutput : MyAssessmentCardDto
{
    public decimal TotalPoints { get; set; }
    public List<MyCompetencyRefDto> Competencies { get; set; } = new();
    public List<MyAttemptSummaryDto> Attempts { get; set; } = new();
}

public class MyAttemptSummaryDto
{
    public Guid Id { get; set; }
    public int AttemptNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public decimal? Score { get; set; }
    public bool? Passed { get; set; }
}
