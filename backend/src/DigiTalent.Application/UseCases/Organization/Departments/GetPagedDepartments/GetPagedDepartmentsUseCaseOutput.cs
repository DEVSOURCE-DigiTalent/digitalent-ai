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
    public bool IsActive { get; set; }
}
