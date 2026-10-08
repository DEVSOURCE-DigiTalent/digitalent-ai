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
    public int Headcount { get; set; }                                       // số nhân viên ACTIVE
    public Dictionary<string, int> GradeDistribution { get; set; } = new(); // { "G1": n, "G2": n, "G3": n }
    public int PositionCount { get; set; }                                   // vị trí chưa archive thuộc phòng ban
    public int SubDepartmentCount { get; set; }                              // phòng ban con chưa archive
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
