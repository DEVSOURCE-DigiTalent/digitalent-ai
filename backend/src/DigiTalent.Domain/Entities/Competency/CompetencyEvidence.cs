using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng competency_evidences. Minh chứng năng lực của nhân viên.
/// </summary>
public class CompetencyEvidence : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }
    public Guid? CompetencyEvaluationResultId { get; set; }
    public string SourceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsLevelConfirming { get; set; }
    public short? ConfirmedLevel { get; set; }
    public decimal? Score { get; set; }
    public string? ReviewNote { get; set; }
    public Guid? ConfirmedByUserId { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public Guid? SupersedesEvidenceId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
