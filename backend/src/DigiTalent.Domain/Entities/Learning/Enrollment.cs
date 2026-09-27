using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng enrollments. Ghi danh: nhân viên đang học khóa nào.
/// </summary>
public class Enrollment : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CourseAssignmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
