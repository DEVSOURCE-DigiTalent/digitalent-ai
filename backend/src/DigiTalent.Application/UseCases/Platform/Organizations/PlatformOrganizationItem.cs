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
}
