namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_competencies. Khóa học này rèn những năng lực nào.
/// </summary>
public class CourseCompetency
{
    public Guid CourseId { get; set; }
    public Guid CompetencyId { get; set; }
    public short TargetLevel { get; set; }
    public string CoverageType { get; set; } = string.Empty;
    public decimal? CoverageWeight { get; set; }
    public string? Note { get; set; }
}
