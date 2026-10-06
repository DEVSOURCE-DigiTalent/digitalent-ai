using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table recommendation_decisions: a reviewer's decision on a course recommended to an employee.
/// One row per employee and course, updated in place; REOPENED puts the recommendation back to pending.
/// </summary>
public class RecommendationDecision : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public Guid? SkillGapRunId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public Guid DecidedByUserId { get; set; }
    public DateTimeOffset DecidedAt { get; set; }
}
