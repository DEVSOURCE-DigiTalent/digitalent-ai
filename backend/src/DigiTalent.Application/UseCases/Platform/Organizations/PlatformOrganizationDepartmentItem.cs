namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class PlatformOrganizationDepartmentItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ManagerName { get; set; }
    public int EmployeeCount { get; set; }
}
