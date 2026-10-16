namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseProctoringUseCaseInput
{
    public Guid CourseId { get; set; }

    /// <summary>PRE_ASSESSMENT (đánh giá trước khi học) | FINAL (bài cuối khóa).</summary>
    public string Kind { get; set; } = string.Empty;
}
