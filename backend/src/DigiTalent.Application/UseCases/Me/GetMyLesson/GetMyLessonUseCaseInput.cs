namespace DigiTalent.Application.UseCases.Me;

public class GetMyLessonUseCaseInput
{
    public Guid CourseId { get; set; }
    public Guid LessonId { get; set; }
}
