namespace DigiTalent.Application.UseCases.Organization.Employees;

public class UpdateEmployeeUseCaseInput
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public Guid? PositionId { get => JobPositionId; set => JobPositionId = value; }
    public Guid? DirectManagerId { get; set; }
    public string? WorkEmail { get; set; }
    public string? Phone { get; set; }
    public DateOnly? JoinedAt { get; set; }
    public Guid? UserId { get; set; }
    public string? Status { get; set; }
}
