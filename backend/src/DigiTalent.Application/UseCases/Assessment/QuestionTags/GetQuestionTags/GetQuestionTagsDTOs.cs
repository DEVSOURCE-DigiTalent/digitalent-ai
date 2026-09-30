namespace DigiTalent.Application.UseCases.Assessment.QuestionTags;

public class GetQuestionTagsUseCaseInput
{
}

public class QuestionTagDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class GetQuestionTagsUseCaseOutput
{
    public List<QuestionTagDto> Items { get; set; } = new();
}
