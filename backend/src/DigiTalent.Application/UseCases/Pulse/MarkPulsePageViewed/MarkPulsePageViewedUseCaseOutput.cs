namespace DigiTalent.Application.UseCases.Pulse;

public class MarkPulsePageViewedUseCaseOutput
{
    public Guid LessonId { get; set; }
    public DateTimeOffset ViewedAt { get; set; }
    /// <summary>Việc xem lại sau lần ôn tập chưa đạt, tính cả trang vừa mở; null khi không cần xem lại.</summary>
    public PulseQuizReviewDto? Review { get; set; }
}
