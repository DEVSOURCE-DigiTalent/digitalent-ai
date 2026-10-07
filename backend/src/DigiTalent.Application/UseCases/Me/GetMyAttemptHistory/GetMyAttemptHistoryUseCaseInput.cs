namespace DigiTalent.Application.UseCases.Me;

public class GetMyAttemptHistoryUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public bool? Passed { get; set; }
    public Guid? AssessmentId { get; set; }
}
