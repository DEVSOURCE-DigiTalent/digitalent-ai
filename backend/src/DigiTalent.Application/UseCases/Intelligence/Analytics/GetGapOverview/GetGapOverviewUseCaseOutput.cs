namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

/// <summary>Frontend services/analytics.service.ts GapOverview.</summary>
public class GetGapOverviewUseCaseOutput
{
    public string GroupBy { get; set; } = GapGroupings.Department;
    public GapStats Totals { get; set; } = new();

    /// <summary>Groups with at least one analysed employee, lowest average coverage first.</summary>
    public List<GapGroup> Groups { get; set; } = new();
}

/// <summary>Aggregates of the latest snapshots of a set of employees.</summary>
public class GapStats
{
    public int Employees { get; set; }
    public decimal AverageCoverage { get; set; }
    public int TotalGaps { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }

    /// <summary>Employees with at least one HIGH gap.</summary>
    public int EmployeesWithHigh { get; set; }
}

public class GapGroup : GapStats
{
    /// <summary>Department id, position id or grade code.</summary>
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public static class GapGroupings
{
    public const string Department = "department";
    public const string Position = "position";
    public const string Grade = "grade";

    public static readonly string[] All = { Department, Position, Grade };
}
