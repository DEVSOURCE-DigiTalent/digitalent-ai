using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class RecommendationReview : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public Guid SkillGapRunId { get; set; }
    public decimal Score { get; set; }
    public int GapsClosed { get; set; }
    public int MandatoryClosed { get; set; }
    public int HighClosed { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public string Status { get; set; } = "PENDING";
    public string? DecisionReason { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
    public Guid? CourseAssignmentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
