namespace DigiTalent.Application.UseCases.Me;

public class StartMyLessonUseCaseOutput
{
    public Guid LessonId { get; set; }
    public string LessonStatus { get; set; } = string.Empty;
    public string EnrollmentStatus { get; set; } = string.Empty;
}
