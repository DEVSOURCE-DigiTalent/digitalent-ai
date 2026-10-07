using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Organization-specific name of one grade of the shared scale (table job_grades, OW-12).
/// Only customised grades have a row; the others use <see cref="Constants.JobGrades.Defaults"/>.
/// </summary>
public class JobGrade : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty; // G1 / G2 / G3
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
