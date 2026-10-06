using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class TrainingBatch : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CourseId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public string Status { get; set; } = "DRAFT";
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
