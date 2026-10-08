namespace DigiTalent.Application.UseCases.Competency;

/// <summary>Filters of the competency matrix (frontend CompetencyMatrixParams). Search matches the name or the employee code.</summary>
public class GetCompetencyMatrixUseCaseInput
{
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }

    /// <summary>Grade of the employee's position: G1 / G2 / G3.</summary>
    public string? JobGrade { get; set; }

    /// <summary>Only the competencies of this category (columns).</summary>
    public Guid? CategoryId { get; set; }

    public string? Search { get; set; }
}
