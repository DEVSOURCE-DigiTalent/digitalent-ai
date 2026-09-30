namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class ApproveQuestionUseCaseInput
{
    public Guid Id { get; set; }
}

public class ApproveQuestionUseCaseOutput
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
