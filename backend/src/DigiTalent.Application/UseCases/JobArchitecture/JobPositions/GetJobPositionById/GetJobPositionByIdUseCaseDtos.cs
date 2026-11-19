namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetJobPositionByIdUseCaseInput
{
    public Guid Id { get; set; }
}

public class GetJobPositionByIdUseCaseOutput
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

    /// <summary>ACTIVE employees holding the position.</summary>
    public int Headcount { get; set; }

    /// <summary>The position has an ACTIVE competency requirement set.</summary>
    public bool HasRequirementSet { get; set; }

    /// <summary>Version number of the ACTIVE requirement set; null when there is none.</summary>
    public int? ActiveRequirementSetVersionNo { get; set; }

    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
