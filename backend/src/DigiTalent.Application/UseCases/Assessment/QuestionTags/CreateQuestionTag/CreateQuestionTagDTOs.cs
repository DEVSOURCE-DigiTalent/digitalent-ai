namespace DigiTalent.Application.UseCases.Assessment.QuestionTags;

public class CreateQuestionTagUseCaseInput
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "TOPIC";
}

public class CreateQuestionTagUseCaseOutput
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
