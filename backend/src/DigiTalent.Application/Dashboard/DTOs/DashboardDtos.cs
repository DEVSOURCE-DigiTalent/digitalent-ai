namespace DigiTalent.Application.Dashboard.DTOs;

public class HrDashboardResponse
{
    public int TotalEmployees { get; set; }
    public int ActiveEnrollments { get; set; }
    public int CompletedCourses { get; set; }
    public int ValidCertificates { get; set; }
    public int HighRiskEmployees { get; set; }
    public int ReadyEmployees { get; set; }
}

public class DepartmentDashboardResponse
{
    public string DepartmentName { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double AvgProgress { get; set; }
    public List<DepartmentRiskItem> RiskItems { get; set; } = new();
}

public class DepartmentRiskItem
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = "LOW";
}

public class TrainerDashboardResponse
{
    public int OwnedCourses { get; set; }
    public int TotalAssessments { get; set; }
    public double AvgPassRate { get; set; }
    public int ActiveLearners { get; set; }
}

public class EmployeeDashboardResponse
{
    public int EnrolledCourses { get; set; }
    public int CompletedCourses { get; set; }
    public double AvgProgress { get; set; }
    public int ValidCertificates { get; set; }
    public int PendingTasks { get; set; }
    public string? LatestRiskLevel { get; set; }
}

// ═══════════════════════════════════════
// Dashboard Reports (Phase 7)
// ═══════════════════════════════════════

public class HeatmapResponse
{
    public List<string> Employees { get; set; } = new();
    public List<string> Competencies { get; set; } = new();
    public List<HeatmapCell> Cells { get; set; } = new();
}

public class HeatmapCell
{
    public string EmployeeName { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public int CurrentLevel { get; set; }
    public int RequiredLevel { get; set; }
    public int GapLevel { get; set; }
    public string Priority { get; set; } = "LOW";
}

public class RiskItemResponse
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = "LOW";
    public DateTimeOffset GeneratedAt { get; set; }
}

public class CertificateReportRow
{
    public Guid CertificateId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string CertificateType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string? IssuedByUserName { get; set; }
}

public class TaskPerformanceRow
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public double AvgScore { get; set; }
    public double AvgOverdueDays { get; set; }
}
