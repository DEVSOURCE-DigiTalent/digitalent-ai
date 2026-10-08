namespace DigiTalent.Application.UseCases.Competency;

/// <summary>Frontend services/workforce.service.ts CompetencyMatrixResponse: columns (competencies) × rows (employees).</summary>
public class GetCompetencyMatrixUseCaseOutput
{
    public List<CompetencyMatrixCategory> Categories { get; set; } = new();
    public List<CompetencyMatrixCompetency> Competencies { get; set; } = new();
    public List<MatrixEmployee> Employees { get; set; } = new();
}

public class CompetencyMatrixCategory
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class CompetencyMatrixCompetency
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string FrameworkCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
}

public class MatrixEmployee
{
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public Guid? JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
    public string? JobGrade { get; set; }

    /// <summary>Coverage of the latest skill gap snapshot; null when none was calculated.</summary>
    public decimal? CoveragePercent { get; set; }

    /// <summary>Competencies of the columns where the current level is below the required one.</summary>
    public int TotalGaps { get; set; }

    /// <summary>One cell per competency column, keyed by competency id.</summary>
    public Dictionary<string, MatrixCell> Cells { get; set; } = new();
}

public class MatrixCell
{
    /// <summary>Confirmed level; 0 = nothing confirmed.</summary>
    public short CurrentLevel { get; set; }

    /// <summary>0 = not required by the position.</summary>
    public int RequiredLevel { get; set; }
    public int Gap { get; set; }

    /// <summary>MIGRATION / TASK / MANUAL.</summary>
    public string? EvidenceSource { get; set; }

    /// <summary>CONFIRMED when a level is confirmed, otherwise NONE.</summary>
    public string EvidenceStatus { get; set; } = "NONE";
    public DateTimeOffset? ConfirmedAt { get; set; }
}
