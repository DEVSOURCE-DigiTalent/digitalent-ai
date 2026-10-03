using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng assigned_task_targets. Năng lực mục tiêu của bài tập đã giao.
/// </summary>
public class AssignedTaskTarget : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskAssignmentId { get; set; }
    public Guid CompetencyId { get; set; }
    public short TargetLevel { get; set; }
    public string? RubricSnapshot { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
