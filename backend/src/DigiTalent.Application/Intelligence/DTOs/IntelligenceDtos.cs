namespace DigiTalent.Application.Intelligence.DTOs;

// ═══════════════════════════════════════
// Skill Gap
// ═══════════════════════════════════════

public class SkillGapResultResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid JobPositionId { get; set; }
    public decimal OverallGapScore { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public List<SkillGapItemResponse> Items { get; set; } = new();
}

public class SkillGapItemResponse
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public int RequiredLevel { get; set; }
    public int CurrentLevel { get; set; }
    public int GapLevel { get; set; }
    public string Priority { get; set; } = "LOW";
    public string? RecommendedAction { get; set; }
}

// ═══════════════════════════════════════
// Learning Recommendations
// ═══════════════════════════════════════

public class LearningRecommendationResponse
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal PriorityScore { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "NEW";
}

// ═══════════════════════════════════════
// Training Risk
// ═══════════════════════════════════════

public class TrainingRiskResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = "LOW";
    public DateTimeOffset GeneratedAt { get; set; }
}

public class TrainingRiskDetailResponse : TrainingRiskResponse
{
    public decimal InactivityScore { get; set; }
    public decimal LowScoreRate { get; set; }
    public decimal DeadlinePressure { get; set; }
    public decimal FailedAttemptRate { get; set; }
    public decimal ProgressDelay { get; set; }
}

// ═══════════════════════════════════════
// Readiness Score
// ═══════════════════════════════════════

public class ReadinessScoreResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid JobPositionId { get; set; }
    public string PositionTitle { get; set; } = string.Empty;
    public decimal CompetencyScore { get; set; }
    public decimal CertificateScore { get; set; }
    public decimal LearningProgressScore { get; set; }
    public decimal ComplianceScore { get; set; }
    public decimal TaskPerformanceScore { get; set; }
    public decimal TotalScore { get; set; }
    public string ReadinessLevel { get; set; } = "NOT_READY";
    public DateTimeOffset GeneratedAt { get; set; }
}

// ═══════════════════════════════════════
// Career Readiness
// ═══════════════════════════════════════

public class CareerReadinessResponse
{
    public Guid EmployeeId { get; set; }
    public Guid TargetJobPositionId { get; set; }
    public string TargetPositionTitle { get; set; } = string.Empty;
    public decimal ReadinessPercent { get; set; }
    public decimal MissingWeight { get; set; }
    public string? RecommendationText { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
}

// ═══════════════════════════════════════
// Request DTOs for action endpoints
// ═══════════════════════════════════════

public class AnalyzeSkillGapRequest
{
    public Guid EmployeeId { get; set; }
    public Guid PositionId { get; set; }
}

public class GenerateRecommendationRequest
{
    public Guid EmployeeId { get; set; }
}

public class RecalculateTrainingRiskRequest
{
    public Guid EmployeeId { get; set; }
}

public class RecalculateReadinessRequest
{
    public Guid EmployeeId { get; set; }
    public Guid PositionId { get; set; }
}

public class AnalyzeCareerReadinessRequest
{
    public Guid EmployeeId { get; set; }
    public Guid TargetPositionId { get; set; }
}
