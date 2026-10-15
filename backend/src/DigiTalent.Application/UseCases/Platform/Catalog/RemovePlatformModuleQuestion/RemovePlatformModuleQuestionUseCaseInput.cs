namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class RemovePlatformModuleQuestionUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public Guid QuestionId { get; set; }
}
