using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng practical_task_targets. Bài tập mẫu này nhắm vào năng lực nào.
/// </summary>
public class PracticalTaskTarget : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskTemplateId { get; set; }
    public Guid CompetencyId { get; set; }
    public short TargetLevel { get; set; }
    public string? RubricCriteria { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
