using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng skill_gap_runs. 1 lần tính khoảng trống năng lực.
/// </summary>
public class SkillGapRun : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Guid RequirementSetId { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public int GapCount { get; set; }
    public string CalculationVersion { get; set; } = string.Empty;
    public string? SummarySnapshot { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
