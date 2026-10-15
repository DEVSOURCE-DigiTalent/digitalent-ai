namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>
/// One organization in the Platform Admin list. "Paid" = at least one purchased seat order.
/// </summary>
public class PlatformOrganizationItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty; // TRIAL / PAID
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public int DepartmentCount { get; set; }
    public int EmployeeCount { get; set; }
    public int ManagerCount { get; set; }
    public int UserCount { get; set; }
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
    public long Revenue { get; set; }
    public bool SetupCompleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>The organization's subscription (latest), null when it has none.</summary>
    public string? PlanCode { get; set; }
    public string? PlanName { get; set; }
    public string? PlanStatus { get; set; }
    public string? PlanCycle { get; set; }
    public int? SeatLimit { get; set; }
    public DateTimeOffset? PlanRenewsAt { get; set; }

    /// <summary>Platform courses the organization's employees are enrolled in, as [Cơ bản, Trung cấp, Nâng cao].</summary>
    public int[] CoursesInUseByLevel { get; set; } = new int[3];
    /// <summary>Employees with at least one (not cancelled) enrollment in a platform course.</summary>
    public int ParticipantCount { get; set; }
}
