namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

/// <summary>Competencies by how many analysed employees fall short of the requirement (most HIGH gaps first).</summary>
public class GetCompetencyGapsUseCaseOutput : List<CompetencyGapRow>
{
}

/// <summary>Frontend services/analytics.service.ts CompetencyGapRow.</summary>
public class CompetencyGapRow
{
    public Guid CompetencyId { get; set; }
    public string FrameworkCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CategoryName { get; set; }

    /// <summary>Analysed employees whose position requires the competency.</summary>
    public int EmployeesRequired { get; set; }
    public int EmployeesWithGap { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public decimal AverageRequiredLevel { get; set; }

    /// <summary>Unconfirmed levels count as 0.</summary>
    public decimal AverageCurrentLevel { get; set; }
}
