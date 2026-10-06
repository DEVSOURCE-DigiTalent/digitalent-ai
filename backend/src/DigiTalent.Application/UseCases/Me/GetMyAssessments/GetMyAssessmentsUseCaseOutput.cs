namespace DigiTalent.Application.UseCases.Me;

public class GetMyAssessmentsUseCaseOutput
{
    public List<MyAssessmentCardDto> Items { get; set; } = new();
    public MyAssessmentSummaryDto Summary { get; set; } = new();
}

public class MyAssessmentSummaryDto
{
    public int Total { get; set; }
    public int Available { get; set; }
    public int InProgress { get; set; }
    public int Passed { get; set; }
    public int Retake { get; set; }
    public int Locked { get; set; }
}
