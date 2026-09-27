namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Thông tin chi tiết 1 phòng ban.
/// KHÔNG trả thẳng entity Department ra ngoài — luôn copy sang Output.
/// </summary>
public class GetDepartmentByIdUseCaseOutput
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public string? ManagerName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
