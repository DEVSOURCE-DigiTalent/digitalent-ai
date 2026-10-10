namespace DigiTalent.Application.UseCases.Learning;

public class CompleteLessonUseCaseInput
{
    public Guid LessonId { get; set; }
}

public class CompleteLessonUseCaseOutput
{
    public Guid LessonProgressId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public decimal CourseProgressPercent { get; set; }
}
