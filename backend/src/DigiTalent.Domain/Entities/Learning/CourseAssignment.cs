using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_assignments. Giao khóa học cho nhân viên.
/// </summary>
public class CourseAssignment : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Guid EmployeeId { get; set; }
    public string AssignmentSource { get; set; } = string.Empty;
    public Guid? SourceDepartmentId { get; set; }
    public Guid? SourceJobPositionId { get; set; }
    public Guid? SourceSkillGapRunId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
