namespace DigiTalent.Application.UseCases.Me;

public class GetMyLearningPathUseCaseOutput
{
    public string? JobPositionName { get; set; }

    /// <summary>Lý do không tính được skill gap (khi đó chỉ có khóa đã được giao, không có gợi ý).</summary>
    public string? SkipReason { get; set; }

    public int OpenGapCount { get; set; }
    public decimal? CoveragePercent { get; set; }
    public MyLearningPathSummaryDto Summary { get; set; } = new();
    public List<MyLearningPathStepDto> Steps { get; set; } = new();
}

public class MyLearningPathSummaryDto
{
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public int InProgressSteps { get; set; }
    public int RecommendedSteps { get; set; }
    public int TotalMinutes { get; set; }
    public int RemainingMinutes { get; set; }
}

public class MyLearningPathStepDto
{
    public int Order { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public short Level { get; set; }
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>ASSIGNED | SELF_ENROLLED | RECOMMENDED</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>COMPLETED | READY_FOR_ASSESSMENT | IN_PROGRESS | NOT_STARTED | RECOMMENDED</summary>
    public string Status { get; set; } = string.Empty;

    public decimal ProgressPercent { get; set; }
    public string? DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public string? AssignedByName { get; set; }

    /// <summary>Lý do khóa có trong lộ trình (giao bởi ai / bù khoảng trống nào).</summary>
    public string Rationale { get; set; } = string.Empty;

    public decimal? RecommendationScore { get; set; }
    public List<MyPathCompetencyDto> TargetCompetencies { get; set; } = new();
    public List<MyPrerequisiteDto> Prerequisites { get; set; } = new();
    public bool CanEnroll { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public class MyPathCompetencyDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public short TargetLevel { get; set; }
    public short? CurrentLevel { get; set; }

    /// <summary>Khóa nâng năng lực đang thiếu của vị trí lên cao hơn mức hiện tại.</summary>
    public bool ClosesGap { get; set; }
}
