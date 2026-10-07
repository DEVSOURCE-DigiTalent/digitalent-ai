using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Kế thừa PagedList → đã có sẵn Items, PageIndex, PageSize, TotalItems, TotalPages.
/// </summary>
public class GetPagedDepartmentsUseCaseOutput : PagedList<DepartmentListItem>
{
}

/// <summary>
/// 1 dòng trong danh sách — chỉ gồm các cột bảng danh sách cần hiển thị.
/// </summary>
public class DepartmentListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public string? ManagerName { get; set; }
    public int Headcount { get; set; }                                       // số nhân viên ACTIVE
    public Dictionary<string, int> GradeDistribution { get; set; } = new(); // { "G1": n, "G2": n, "G3": n }
    public string Status { get; set; } = string.Empty;
}
