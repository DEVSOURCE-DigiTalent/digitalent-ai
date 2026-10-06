using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class TrainingBatchEmployee : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TrainingBatchId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid? CourseAssignmentId { get; set; }
    public string Status { get; set; } = "ENROLLED";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
