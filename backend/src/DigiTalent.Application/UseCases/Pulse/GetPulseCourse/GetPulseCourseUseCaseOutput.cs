namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseCourseUseCaseOutput
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    public string? Description { get; set; }
    public string? Purpose { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int VersionNo { get; set; }
    public PulseDomainDto Domain { get; set; } = new();
    public bool Assessed { get; set; }
    public List<string> LearningOutcomes { get; set; } = new();
    public List<PulseCourseModuleDto> Modules { get; set; } = new();
    public List<PulseCriterionDto> FinalCriteria { get; set; } = new();
    /// <summary>Bước tiếp theo trên trang khóa: BASELINE | MODULE | FINAL | PREVIEW | DONE.</summary>
    public string NextAction { get; set; } = string.Empty;
    public Guid? NextModuleId { get; set; }
}

public class PulseCourseModuleDto
{
    public Guid ModuleId { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SlideCount { get; set; }
    public bool HasQuiz { get; set; }
    public int QuizQuestionCount { get; set; }
    public bool Viewed { get; set; }
    public bool Passed { get; set; }
    /// <summary>Đã qua mô đun trước (mô đun 1 luôn mở theo thứ tự).</summary>
    public bool Unlocked { get; set; }
    /// <summary>Được mở để đọc: khóa có quyền đầy đủ, hoặc trang mẫu của mô đun 1 khi chưa có suất.</summary>
    public bool Viewable { get; set; }
}
