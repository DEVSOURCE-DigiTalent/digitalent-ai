namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseModuleQuizUseCaseOutput
{
    public int Score { get; set; }
    public int Total { get; set; }
    public bool Passed { get; set; }
    /// <summary>Câu chưa đúng và trang nội dung liên quan (không lộ đáp án hay lời giải).</summary>
    public List<PulseWrongAnswerDto> Wrong { get; set; } = new();
    /// <summary>Chưa đạt: các trang phải mở lại trước lần làm tiếp theo (lần sau sẽ là câu khác). null khi đạt.</summary>
    public PulseQuizReviewDto? Review { get; set; }
    public bool ModulePassed { get; set; }
    public Guid? NextModuleId { get; set; }
    public bool AllModulesPassed { get; set; }
}

public class PulseWrongAnswerDto
{
    public Guid QuestionId { get; set; }
    /// <summary>Trang nội dung liên quan tới câu này (null khi mô đun không có trang).</summary>
    public Guid? LessonId { get; set; }
    public int? PageIndex { get; set; }
    public string? PageTitle { get; set; }
}
