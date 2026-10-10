namespace DigiTalent.Application.UseCases.Learning;

public class SubmitQuizAttemptUseCaseInput
{
    public Guid AttemptId { get; set; }
    public List<AnswerSubmission> Answers { get; set; } = new();
}

public class AnswerSubmission
{
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
}

public class SubmitQuizAttemptUseCaseOutput
{
    public Guid AttemptId { get; set; }
    public decimal Score { get; set; }
    public decimal PassingScore { get; set; }
    public bool Passed { get; set; }
    public List<AnswerResultDto> Results { get; set; } = new();
    public string? CertificateCode { get; set; }
    public bool CourseCompleted { get; set; }
}

public class AnswerResultDto
{
    public Guid QuestionId { get; set; }
    public bool IsCorrect { get; set; }
    public decimal PointsAwarded { get; set; }
    public Guid? CorrectOptionId { get; set; }
}
