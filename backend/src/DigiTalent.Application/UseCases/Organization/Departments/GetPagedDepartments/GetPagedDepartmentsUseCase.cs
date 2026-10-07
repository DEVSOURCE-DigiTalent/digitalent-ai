using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Danh sách phòng ban có phân trang, tìm kiếm theo mã/tên, lọc theo trạng thái.
/// Mặc định (không gửi Status) KHÔNG hiện phòng ban đã archive.
/// </summary>
public class GetPagedDepartmentsUseCase : IUseCase<GetPagedDepartmentsUseCaseInput, GetPagedDepartmentsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPagedDepartmentsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPagedDepartmentsUseCaseOutput> ExecuteAsync(GetPagedDepartmentsUseCaseInput input)
    {
        // 1. Tạo câu query (CHƯA chạy xuống database) — chỉ trong tổ chức của người gọi
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _context.Departments
            .Where(d => d.OrganizationId == organizationId);

        // 2. Thêm điều kiện lọc nếu frontend có gửi
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            query = query.Where(d => d.Code.ToLower().Contains(keyword)
                                  || d.Name.ToLower().Contains(keyword));
        }

        query = string.IsNullOrWhiteSpace(input.Status)
            ? query.Where(d => d.Status != Statuses.MasterData.Archived)
            : query.Where(d => d.Status == input.Status);

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
                ParentDepartmentId = d.ParentDepartmentId,
                ParentDepartmentName = _context.Departments
                    .Where(p => p.Id == d.ParentDepartmentId)
                    .Select(p => p.Name)
                    .FirstOrDefault(),
                ManagerEmployeeId = d.ManagerEmployeeId,
                ManagerName = _context.Employees
                    .Where(e => e.Id == d.ManagerEmployeeId)
                    .Select(e => e.FullName)
                    .FirstOrDefault(),
                Status = d.Status,
            })
            .ToListAsync();

        // 5. Sĩ số + phân bố cấp bậc của các phòng ban trong trang (1 query gom nhóm)
        var stats = await DepartmentRules.LoadStatsAsync(_context, items.Select(i => i.Id).ToList());
        foreach (var item in items)
        {
            item.Headcount = stats[item.Id].Headcount;
            item.GradeDistribution = stats[item.Id].GradeDistribution;
        }

        // 6. Trả kết quả
        return new GetPagedDepartmentsUseCaseOutput
        {
            Items = items,
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = totalItems,
        };
    }
}
