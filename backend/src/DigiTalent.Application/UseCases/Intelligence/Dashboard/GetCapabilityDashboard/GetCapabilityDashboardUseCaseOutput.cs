namespace DigiTalent.Application.UseCases.Intelligence.Dashboard;

/// <summary>Matches the frontend <c>DashboardDto</c> (services/analytics.service.ts).</summary>
public class GetCapabilityDashboardUseCaseOutput
{
    public CapabilityKpis Kpis { get; set; } = new();
    public List<CapabilityDomain> Domains { get; set; } = new();
    public List<AtRiskEmployee> AtRisk { get; set; } = new();
}

public class CapabilityKpis
{
    /// <summary>Active employees with at least one skill gap run.</summary>
    public int Employees { get; set; }
    /// <summary>Average coverage of the latest runs, in percent.</summary>
    public decimal AverageCoverage { get; set; }
    public int EmployeesWithHigh { get; set; }
    /// <summary>ACTIVE assignments past their due date without a COMPLETED enrollment.</summary>
    public int OverdueAssignments { get; set; }
    /// <summary>Percentage of ACTIVE assignments with a COMPLETED enrollment, rounded to an integer.</summary>
    public decimal CompletionRate { get; set; }
    /// <summary>Top 3 recommended courses per employee that are not enrolled and not yet accepted or dismissed.</summary>
    public int PendingRecommendations { get; set; }
}

/// <summary>Average required and current level of one competency category.</summary>
public class CapabilityDomain
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public decimal AverageRequired { get; set; }
    /// <summary>Capped at the required level, so exceeding one requirement does not offset gaps in others.</summary>
    public decimal AverageCurrent { get; set; }
}

public class AtRiskEmployee
{
    public Guid EmployeeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public int HighCount { get; set; }
    public decimal CoveragePercent { get; set; }
}
