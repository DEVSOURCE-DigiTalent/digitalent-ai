using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng training_risk_scores. Điểm rủi ro học tập.
/// </summary>
public class TrainingRiskScore : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public decimal InactivityScore { get; set; }
    public decimal LowScoreRate { get; set; }
    public decimal DeadlinePressure { get; set; }
    public decimal FailedAttemptRate { get; set; }
    public decimal ProgressDelay { get; set; }
    public Guid? ScoringConfigId { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
