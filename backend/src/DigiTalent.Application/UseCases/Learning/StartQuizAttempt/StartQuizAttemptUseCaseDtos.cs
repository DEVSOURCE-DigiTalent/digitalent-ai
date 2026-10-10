namespace DigiTalent.Application.UseCases.Learning;

public class StartQuizAttemptUseCaseInput
{
    public Guid AssessmentId { get; set; }
}

public class StartQuizAttemptUseCaseOutput
{
    public Guid AttemptId { get; set; }
    public int AttemptNo { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public List<QuizQuestionDto> Questions { get; set; } = new();
}

public class QuizQuestionDto
{
    public Guid QuestionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public decimal Points { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
}

public class QuizOptionDto
{
    public Guid OptionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
