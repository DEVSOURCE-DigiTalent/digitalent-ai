namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetPagedJobPositionsUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? JobFamilyId { get; set; }
    /// <summary>Only the positions the department's active employees hold.</summary>
    public Guid? DepartmentId { get; set; }
    public string? JobGrade { get; set; } // G1 | G2 | G3
}

public class JobPositionListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? JobFamilyId { get; set; }
    public string? JobFamilyName { get; set; }
    /// <summary>Departments whose active employees hold the position (a position is shared by every department).</summary>
    public List<string> Departments { get; set; } = new();
    public string? JobGrade { get; set; }
    public string? JobGradeName { get; set; }

    /// <summary>ACTIVE employees holding the position (in the filtered department when one is given).</summary>
    public int Headcount { get; set; }
    public bool UsedByOtherDepartments { get; set; }

    /// <summary>The position has an ACTIVE competency requirement set (skill gap can be computed).</summary>
    public bool HasRequirementSet { get; set; }

    public string Status { get; set; } = string.Empty;
}

public class GetPagedJobPositionsUseCaseOutput
{
    public List<JobPositionListItem> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}
