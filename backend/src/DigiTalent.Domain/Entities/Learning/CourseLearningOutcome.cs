using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_learning_outcomes. Chuẩn đầu ra của khóa học.
/// </summary>
public class CourseLearningOutcome : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid CompetencyId { get; set; }
    public short TargetLevel { get; set; }
    public string OutcomeType { get; set; } = string.Empty;
    public string Statement { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public string? SourceRef { get; set; }
    public string? AssessmentMethod { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
