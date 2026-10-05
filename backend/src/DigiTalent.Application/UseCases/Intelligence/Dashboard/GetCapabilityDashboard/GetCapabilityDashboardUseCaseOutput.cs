namespace DigiTalent.Application.UseCases.Intelligence.Dashboard;

/// <summary>Khớp DashboardDto của frontend (services/analytics.service.ts).</summary>
public class GetCapabilityDashboardUseCaseOutput
{
    public CapabilityKpis Kpis { get; set; } = new();
    public List<CapabilityDomain> Domains { get; set; } = new();
    public List<AtRiskEmployee> AtRisk { get; set; } = new();
}

public class CapabilityKpis
{
    /// <summary>Nhân viên đang làm việc đã có snapshot skill gap.</summary>
    public int Employees { get; set; }
    /// <summary>Coverage trung bình (%) của snapshot mới nhất.</summary>
    public decimal AverageCoverage { get; set; }
    public int EmployeesWithHigh { get; set; }
    /// <summary>Phân công ACTIVE quá hạn mà chưa có enrollment COMPLETED.</summary>
    public int OverdueAssignments { get; set; }
    /// <summary>% phân công ACTIVE đã có enrollment COMPLETED (số nguyên).</summary>
    public decimal CompletionRate { get; set; }
    /// <summary>Khóa được gợi ý (top 3 mỗi nhân viên) chưa ghi danh và chưa có quyết định ACCEPTED/DISMISSED.</summary>
    public int PendingRecommendations { get; set; }
}

/// <summary>Trình độ yêu cầu và hiện tại trung bình của một miền năng lực.</summary>
public class CapabilityDomain
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public decimal AverageRequired { get; set; }
    /// <summary>Mức hiện tại được chặn trần ở mức yêu cầu (vượt yêu cầu không bù cho năng lực khác).</summary>
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
