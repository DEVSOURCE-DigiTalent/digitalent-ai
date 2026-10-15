namespace DigiTalent.Application.UseCases.Pulse;

public class MarkPulsePageViewedUseCaseInput
{
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    /// <summary>Trang nội dung (bài học) của mô đun.</summary>
    public Guid LessonId { get; set; }
}
