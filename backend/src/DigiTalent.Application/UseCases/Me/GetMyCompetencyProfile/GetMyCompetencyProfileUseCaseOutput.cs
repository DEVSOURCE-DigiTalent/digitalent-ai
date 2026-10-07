namespace DigiTalent.Application.UseCases.Me;

public class GetMyCompetencyProfileUseCaseOutput
{
    public MyEmployeeInfoDto Employee { get; set; } = new();
    public MyRequirementSetDto? RequirementSet { get; set; }

    /// <summary>NO_JOB_POSITION | NO_ACTIVE_REQUIREMENT_SET | EMPLOYEE_NOT_ACTIVE — null khi tính được.</summary>
    public string? SkipReason { get; set; }

    public MyCompetencySummaryDto? Summary { get; set; }
    public List<MyProfileCompetencyDto> Items { get; set; } = new();

    /// <summary>Năng lực đã xác nhận nhưng vị trí hiện tại không yêu cầu.</summary>
    public List<MyConfirmedCompetencyDto> OtherConfirmed { get; set; } = new();
}

public class MyEmployeeInfoDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
    public string? DepartmentName { get; set; }
    public string? JobPositionName { get; set; }
    public string? JobFamilyName { get; set; }
    public string? ManagerName { get; set; }
    public string? JoinedAt { get; set; }
}

public class MyRequirementSetDto
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }
    public string? EffectiveFrom { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }
}

public class MyProfileCompetencyDto : MyCompetencyLineDto
{
    public int ConfirmedEvidenceCount { get; set; }
    public int PendingEvidenceCount { get; set; }
}
