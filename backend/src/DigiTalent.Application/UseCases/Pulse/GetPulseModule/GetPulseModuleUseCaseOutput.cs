namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseModuleUseCaseOutput
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    public PulseModuleDetailDto Module { get; set; } = new();
    public List<PulseModuleNavDto> Modules { get; set; } = new();
    /// <summary>true = trang mẫu (khóa có phí chưa có suất): chỉ trang đầu tiên của mô đun 1, không có câu hỏi.</summary>
    public bool Sample { get; set; }
    public List<PulseSlideDto> Slides { get; set; } = new();
    public bool Viewed { get; set; }
    public bool QuizPassed { get; set; }
    public PulseQuizResultDto? LastQuiz { get; set; }
    /// <summary>
    /// Câu hỏi của lần làm kế tiếp (không kèm đáp án). null khi mô đun không có câu hỏi, nhân viên chưa được làm, hoặc
    /// còn phải xem lại trang sau lần chưa đạt (xem <see cref="Review"/>).
    /// </summary>
    public PulseQuizDto? Quiz { get; set; }
    /// <summary>Trang phải mở lại sau lần làm chưa đạt gần nhất; null khi không cần (chưa làm, đã đạt).</summary>
    public PulseQuizReviewDto? Review { get; set; }
    /// <summary>Lý do chưa làm được câu hỏi ôn tập (xem PulseBlockReason), null = làm được (sau khi đọc hết trang).</summary>
    public string? QuizBlockReason { get; set; }
    public Guid? NextModuleId { get; set; }
    public bool AllModulesPassed { get; set; }
}

public class PulseModuleDetailDto
{
    public Guid ModuleId { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedMinutes { get; set; }
}

public class PulseModuleNavDto
{
    public Guid ModuleId { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public bool Viewable { get; set; }
}

public class PulseSlideDto
{
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    /// <summary>Nội dung Markdown hoặc HTML (FE làm sạch trước khi hiển thị).</summary>
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
}

public class PulseQuizDto
{
    public Guid AssessmentId { get; set; }
    /// <summary>Lần làm mà bộ câu này thuộc về; gửi lại khi nộp để phát hiện bộ câu đã đổi (QUIZ_CHANGED).</summary>
    public int AttemptNo { get; set; }
    public List<PulseQuizQuestionDto> Questions { get; set; } = new();
}

public class PulseQuizReviewDto
{
    /// <summary>Lần làm chưa đạt gần nhất.</summary>
    public int AttemptNo { get; set; }
    public DateTimeOffset FailedAt { get; set; }
    /// <summary>true = đã mở lại mọi trang cần xem, được làm lần tiếp theo.</summary>
    public bool Done { get; set; }
    public List<PulseQuizReviewPageDto> Pages { get; set; } = new();
}

public class PulseQuizReviewPageDto
{
    public Guid LessonId { get; set; }
    /// <summary>Vị trí trang trong mô đun (0-based).</summary>
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    /// <summary>Đã mở lại sau lần chưa đạt.</summary>
    public bool Done { get; set; }
}

public class PulseQuizQuestionDto
{
    public Guid QuestionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<PulseOptionDto> Options { get; set; } = new();
}

public class PulseQuizResultDto
{
    public int Score { get; set; }
    public int Total { get; set; }
    public bool Passed { get; set; }
    public DateTimeOffset At { get; set; }
}
