namespace DigiTalent.Application.UseCases.Intelligence.Recommendation;

/// <summary>API contract: spec §5.4 (+ §5.6 R6 cho Reason).</summary>
public class GetCourseRecommendationsUseCaseOutput
{
    public Guid? EmployeeId { get; set; }
    public Guid? SkillGapRunId { get; set; }
    public DateTimeOffset? GeneratedAt { get; set; }
    public string ScoringConfigVersion { get; set; } = string.Empty;

    /// <summary>null khi có gợi ý; ngược lại NO_EMPLOYEE_PROFILE / NO_SKILL_GAP_RUN / NO_GAP / NO_MATCHING_COURSE.</summary>
    public string? Reason { get; set; }

    public List<CourseRecommendationDto> Items { get; set; } = new();
}

public class CourseRecommendationDto
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? EstimatedDurationMinutes { get; set; }
    public short? EntryLevel { get; set; }

    /// <summary>NOT_STARTED / IN_PROGRESS / READY_FOR_ASSESSMENT khi đang học; null khi chưa đăng ký.</summary>
    public string? EnrollmentStatus { get; set; }

    public decimal Score { get; set; }
    public RecommendationBreakdownDto Breakdown { get; set; } = new();
    public List<RecommendationReasonDto> Reasons { get; set; } = new();
    public string Explanation { get; set; } = string.Empty;
    public List<string> Warnings { get; set; } = new();
}

/// <summary>Điểm từng thành phần (trọng số × tỉ lệ).</summary>
public class RecommendationBreakdownDto
{
    public decimal GapPriorityCoverage { get; set; }
    public decimal MandatoryCoverage { get; set; }
    public decimal EntryLevelFit { get; set; }
}

public class RecommendationReasonDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public short? CurrentLevel { get; set; }
    public short RequiredLevel { get; set; }
    public short CourseTargetLevel { get; set; }
    public string CoverageType { get; set; } = string.Empty;
    public short ClosesSteps { get; set; }
    public bool Mandatory { get; set; }
    public string? Severity { get; set; }
}
