namespace DigiTalent.Application.UseCases.Competency;

/// <summary>Requirement state of every position that is not archived (OW-16), by position code.</summary>
public class GetPositionRequirementSummariesUseCaseOutput : List<PositionRequirementSummary>
{
}

/// <summary>Frontend services/competency.service.ts PositionRequirementSummary.</summary>
public class PositionRequirementSummary
{
    public Guid JobPositionId { get; set; }
    public string JobPositionCode { get; set; } = string.Empty;
    public string JobPositionName { get; set; } = string.Empty;
    public string? JobGrade { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }

    /// <summary>Active employees holding the position.</summary>
    public int EmployeeCount { get; set; }

    public RequirementSetBrief? ActiveSet { get; set; }
    public RequirementSetBrief? DraftSet { get; set; }

    /// <summary>Requirement sets of the position in any status.</summary>
    public int TotalVersions { get; set; }

    /// <summary>ACTIVE (has an active set) / DRAFT (only a draft) / NOT_CONFIGURED.</summary>
    public string Status { get; set; } = RequirementSummaryStatuses.NotConfigured;
}

public class RequirementSetBrief
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }
    public DateOnly? EffectiveFrom { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }
    public int CompetencyCount { get; set; }
}

public static class RequirementSummaryStatuses
{
    public const string Active = "ACTIVE";
    public const string Draft = "DRAFT";
    public const string NotConfigured = "NOT_CONFIGURED";
}
