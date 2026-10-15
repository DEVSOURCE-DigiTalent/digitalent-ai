namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class PlatformOrganizationPersonItem
{
    public Guid? UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public string Status { get; set; } = string.Empty;
}
