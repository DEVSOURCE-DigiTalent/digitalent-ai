namespace DigiTalent.Application.UseCases.Competency;

/// <summary>Where a competency is used in the organization (frontend services/competency.service.ts CompetencyUsage, OW-15).</summary>
public class GetCompetencyUsageUseCaseOutput
{
    /// <summary>Active positions whose ACTIVE requirement set includes the competency.</summary>
    public List<CompetencyUsagePosition> Positions { get; set; } = new();

    /// <summary>Published courses (latest version of each code) that teach the competency.</summary>
    public List<CompetencyUsageCourse> Courses { get; set; } = new();

    /// <summary>Active employees in scope per confirmed level: keys "0" (nothing confirmed) to "3".</summary>
    public Dictionary<string, int> LevelDistribution { get; set; } = new();

    /// <summary>Active employees in scope whose position requires a higher level than they hold, biggest gap first.</summary>
    public List<EmployeeWithGap> EmployeesWithGap { get; set; } = new();
}

public class CompetencyUsagePosition
{
    public Guid PositionId { get; set; }
    public string PositionName { get; set; } = string.Empty;
    public int RequiredLevel { get; set; }
    public bool IsMandatory { get; set; }
    public decimal WeightPercent { get; set; }

    /// <summary>Active employees in scope holding the position.</summary>
    public int Employees { get; set; }
}

public class CompetencyUsageCourse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    /// <summary>Level the course brings the competency to (course_competencies.target_level).</summary>
    public short Level { get; set; }

    /// <summary>Course assignments that are not cancelled.</summary>
    public int Assigned { get; set; }
}

public class EmployeeWithGap
{
    public Guid EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string JobPositionName { get; set; } = string.Empty;
    public string? JobGrade { get; set; }
    public short CurrentLevel { get; set; }
    public int RequiredLevel { get; set; }
    public int Gap { get; set; }
}
