using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Intelligence;

public class SkillGapResult : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Guid JobPositionId { get; set; }
    public decimal OverallGapScore { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = "SYSTEM";
    public string? SnapshotJson { get; set; }

    public ICollection<SkillGapItem> Items { get; set; } = new List<SkillGapItem>();
}

public class SkillGapItem : AuditableEntity
{
    public Guid SkillGapResultId { get; set; }
    public SkillGapResult SkillGapResult { get; set; } = null!;
    public Guid CompetencyId { get; set; }
    public int RequiredLevelValue { get; set; }
    public int CurrentLevelValue { get; set; }
    public int GapLevel { get; set; }
    public string Priority { get; set; } = "LOW";
    public string? RecommendedAction { get; set; }
}

public class LearningRecommendation : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Guid? SourceSkillGapResultId { get; set; }
    public Guid CourseId { get; set; }
    public decimal PriorityScore { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "NEW";
}

public class TrainingRiskScore : AuditableEntity
{
    public Guid EnrollmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = "LOW";
    public decimal InactivityScore { get; set; }
    public decimal LowScoreRate { get; set; }
    public decimal DeadlinePressure { get; set; }
    public decimal FailedAttemptRate { get; set; }
    public decimal ProgressDelay { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
}

public class ReadinessScore : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Guid JobPositionId { get; set; }
    public decimal CompetencyScore { get; set; }
    public decimal CertificateScore { get; set; }
    public decimal LearningProgressScore { get; set; }
    public decimal ComplianceScore { get; set; }
    public decimal TaskPerformanceScore { get; set; }
    public decimal TotalScore { get; set; }
    public string ReadinessLevel { get; set; } = "NOT_READY";
    public DateTimeOffset GeneratedAt { get; set; }
    public string? SnapshotJson { get; set; }
}

public class PromotionReadinessResult : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Guid TargetJobPositionId { get; set; }
    public decimal ReadinessPercent { get; set; }
    public decimal MissingWeight { get; set; }
    public string? RecommendationText { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
}

public class AiExplanationLog : AuditableEntity
{
    public string FeatureType { get; set; } = string.Empty;
    public string? SourceEntityType { get; set; }
    public Guid? SourceEntityId { get; set; }
    public string InputSnapshotJson { get; set; } = string.Empty;
    public string OutputText { get; set; } = string.Empty;
    public string? ModelProvider { get; set; }
    public string? ModelName { get; set; }
    public Guid? CreatedByUserId { get; set; }
}
