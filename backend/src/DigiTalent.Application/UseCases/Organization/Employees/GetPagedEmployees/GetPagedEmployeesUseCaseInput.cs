namespace DigiTalent.Application.UseCases.Organization.Employees;

public class GetPagedEmployeesUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? PositionId { get; set; }
    public Guid? JobPositionId { get => PositionId; set => PositionId = value; }
    public string? Status { get; set; }
}
