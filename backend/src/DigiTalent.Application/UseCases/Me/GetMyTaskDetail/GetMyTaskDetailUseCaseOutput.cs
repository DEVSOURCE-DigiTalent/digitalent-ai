namespace DigiTalent.Application.UseCases.Me;

public class GetMyTaskDetailUseCaseOutput : MyTaskCardDto
{
    public List<RubricCriterionDto> Rubric { get; set; } = new();

    /// <summary>Mọi phiên bản bài nộp của mình, mới nhất trước.</summary>
    public List<MyTaskSubmissionDto> Submissions { get; set; } = new();

    public long MaxAttachmentBytes { get; set; }
    public int MaxAttachments { get; set; }
    public List<string> AllowedExtensions { get; set; } = new();
}
