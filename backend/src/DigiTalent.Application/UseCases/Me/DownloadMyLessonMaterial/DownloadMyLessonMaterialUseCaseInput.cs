namespace DigiTalent.Application.UseCases.Me;

public class DownloadMyLessonMaterialUseCaseInput
{
    public Guid CourseId { get; set; }
    public Guid LessonId { get; set; }
    public Guid MaterialId { get; set; }
}
