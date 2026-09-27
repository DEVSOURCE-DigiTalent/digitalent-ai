using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Kế thừa PaginationRequest → đã có sẵn PageIndex, PageSize, Search.
/// Chỉ cần khai báo thêm bộ lọc riêng của phòng ban.
/// </summary>
public class GetPagedDepartmentsUseCaseInput : PaginationRequest
{
    public string? Status { get; set; } // null = lấy tất cả. VD: ACTIVE
}
