using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng task_assignments. Giao bài tập thực hành cho nhân viên.
/// </summary>
public class TaskAssignment : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? TaskTemplateId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid? PromptingCourseId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public Guid ReviewerUserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset? DueAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string TitleSnapshot { get; set; } = string.Empty;
    public string DescriptionSnapshot { get; set; } = string.Empty;
    public string ExpectedOutputSnapshot { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
