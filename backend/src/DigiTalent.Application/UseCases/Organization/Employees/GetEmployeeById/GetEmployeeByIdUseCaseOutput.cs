namespace DigiTalent.Application.UseCases.Organization.Employees;

public class GetEmployeeByIdUseCaseOutput
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? JobPositionId { get; set; }
    public Guid? PositionId => JobPositionId;
    public string? PositionName { get; set; }
    public string? JobPositionName => PositionName;
    public Guid? DirectManagerId { get; set; }
    public string? DirectManagerName { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? JoinedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
