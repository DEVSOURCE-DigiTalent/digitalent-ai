using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng readiness_scores. Điểm sẵn sàng cho chức danh.
/// </summary>
public class ReadinessScore : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Guid JobPositionId { get; set; }
    public Guid? RequirementSetId { get; set; }
    public decimal CompetencyScore { get; set; }
    public decimal CertificateScore { get; set; }
    public decimal LearningProgressScore { get; set; }
    public decimal ComplianceScore { get; set; }
    public decimal TaskPerformanceScore { get; set; }
    public decimal TotalScore { get; set; }
    public string ReadinessLevel { get; set; } = string.Empty;
    public Guid? ScoringConfigId { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string? SnapshotJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
