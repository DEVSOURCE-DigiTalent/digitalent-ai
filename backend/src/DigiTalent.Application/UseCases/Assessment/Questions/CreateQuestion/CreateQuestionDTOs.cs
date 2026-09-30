namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class CreateQuestionOptionInput
{
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class CreateQuestionUseCaseInput
{
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public List<CreateQuestionOptionInput> Options { get; set; } = new();
    public List<Guid> TagIds { get; set; } = new();
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class QuestionTagRefDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class CreateQuestionUseCaseOutput
{
    public Guid Id { get; set; }
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = string.Empty;
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
    public List<QuestionTagRefDto> Tags { get; set; } = new();
}
