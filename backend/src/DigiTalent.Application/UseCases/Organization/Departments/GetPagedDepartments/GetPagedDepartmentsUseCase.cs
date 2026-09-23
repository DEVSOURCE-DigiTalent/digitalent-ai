using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Danh sách phòng ban có phân trang, tìm kiếm theo mã/tên, lọc theo trạng thái.
/// </summary>
public class GetPagedDepartmentsUseCase : IUseCase<GetPagedDepartmentsUseCaseInput, GetPagedDepartmentsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPagedDepartmentsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetPagedDepartmentsUseCaseOutput> ExecuteAsync(GetPagedDepartmentsUseCaseInput input)
    {
        // 1. Tạo câu query (CHƯA chạy xuống database)
        var query = _context.Departments.AsQueryable();

        // 2. Thêm điều kiện lọc nếu frontend có gửi
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            query = query.Where(d => d.Code.ToLower().Contains(keyword)
                                  || d.Name.ToLower().Contains(keyword));
        }

        if (input.IsActive.HasValue)
        {
            query = query.Where(d => d.IsActive == input.IsActive.Value);
        }

        // 3. Đếm tổng số dòng (để frontend tính số trang)
        var totalItems = await query.CountAsync();

        // 4. Lấy dữ liệu của trang hiện tại
        var items = await query
            .OrderBy(d => d.Code)
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(d => new DepartmentListItem
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                IsActive = d.IsActive,
            })
            .ToListAsync();

        // 5. Trả kết quả
        return new GetPagedDepartmentsUseCaseOutput
        {
            Items = items,
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = totalItems,
        };
    }
}
