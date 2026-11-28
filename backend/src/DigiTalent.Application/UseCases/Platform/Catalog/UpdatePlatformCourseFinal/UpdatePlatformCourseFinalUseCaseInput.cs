namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCourseFinalUseCaseInput
{
    public int VersionNo { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PromptHtml { get; set; }
    public List<string> Criteria { get; set; } = new();
    public List<int>? CriterionWeights { get; set; }
    public List<int>? ExpectedCriterionWeights { get; set; }
}
