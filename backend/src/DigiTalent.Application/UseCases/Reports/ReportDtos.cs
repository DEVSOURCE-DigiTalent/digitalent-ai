namespace DigiTalent.Application.UseCases.Reports;

// ── Dashboard ──
public class GetDashboardInput { }

public class DashboardDto
{
    public DashboardKpis Kpis { get; set; } = new();
    public List<DomainStats> Domains { get; set; } = new();
    public List<AtRiskEmployee> AtRisk { get; set; } = new();
}

public class DashboardKpis
{
    public int Employees { get; set; }
    public decimal AverageCoverage { get; set; }
    public int EmployeesWithHigh { get; set; }
    public int OverdueAssignments { get; set; }
    public decimal CompletionRate { get; set; }
    public int PendingRecommendations { get; set; }
}

public class DomainStats
{
    public string CategoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public decimal AverageRequired { get; set; }
    public decimal AverageCurrent { get; set; }
}

public class AtRiskEmployee
{
    public string EmployeeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public int HighCount { get; set; }
    public decimal CoveragePercent { get; set; }
}

// ── Reports overview ──
public class GetReportsOverviewInput
{
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
}

public class ReportsOverviewDto
{
    public WorkforceReport Workforce { get; set; } = new();
    public TrainingReport Training { get; set; } = new();
    public AssessmentReport Assessment { get; set; } = new();
    public EvidenceReport Evidence { get; set; } = new();
}

public class WorkforceReport
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int DepartmentsCount { get; set; }
    public int PositionsCount { get; set; }
    public int G1Count { get; set; }
    public int G2Count { get; set; }
    public int G3Count { get; set; }
    public List<DepartmentSummary> ByDepartment { get; set; } = new();
}

public class DepartmentSummary
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public decimal AverageCoverage { get; set; }
}

public class TrainingReport
{
    public int TotalAssignments { get; set; }
    public int CompletedAssignments { get; set; }
    public int InProgressAssignments { get; set; }
    public decimal CompletionRate { get; set; }
    public List<CourseTrainingSummary> Courses { get; set; } = new();
}

public class CourseTrainingSummary
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? DomainName { get; set; }
    public int LearnerCount { get; set; }
    public decimal AverageProgress { get; set; }
}

public class AssessmentReport
{
    public int TotalAttempts { get; set; }
    public decimal PassRate { get; set; }
    public decimal AverageScore { get; set; }
    public int RetakeCount { get; set; }
    public int ExcellentCount { get; set; }
    public decimal ExcellentPercent { get; set; }
    public int StandardCount { get; set; }
    public decimal StandardPercent { get; set; }
    public int FailedCount { get; set; }
    public decimal FailedPercent { get; set; }
    public decimal AverageDurationMinutes { get; set; }
    public decimal FirstTimePassRate { get; set; }
}

public class EvidenceReport
{
    public int TotalTasks { get; set; }
    public int TotalSubmissions { get; set; }
    public int ApprovedCount { get; set; }
    public decimal ApprovalRate { get; set; }
    public List<DepartmentEvidenceSummary> ByDepartment { get; set; } = new();
}

public class DepartmentEvidenceSummary
{
    public string DepartmentId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int AssignedCount { get; set; }
    public int SubmittedCount { get; set; }
    public int ApprovedCount { get; set; }
    public decimal ApprovalRate { get; set; }
}
