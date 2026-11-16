using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Employees;

/// <summary>
/// Danh sách nhân viên có phân trang, tìm kiếm họ tên/mã, lọc theo phòng ban, vị trí, trạng thái.
/// Mặc định (không gửi Status) KHÔNG hiện nhân viên đã archive.
/// Chỉ trả nhân viên trong phạm vi người gọi (EmployeeScope — Department Manager: phòng mình, BR-12).
/// </summary>
public class GetPagedEmployeesUseCase : IUseCase<GetPagedEmployeesUseCaseInput, GetPagedEmployeesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _employeeScope;

    public GetPagedEmployeesUseCase(IApplicationDbContext context, EmployeeScope employeeScope)
    {
        _context = context;
        _employeeScope = employeeScope;
    }

    public async Task<GetPagedEmployeesUseCaseOutput> ExecuteAsync(GetPagedEmployeesUseCaseInput input)
    {
        var query = _employeeScope.VisibleEmployees();

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            query = query.Where(e => e.FullName.ToLower().Contains(keyword)
                                  || e.EmployeeCode.ToLower().Contains(keyword));
        }

        if (input.DepartmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == input.DepartmentId.Value);
        }

        query = string.IsNullOrWhiteSpace(input.Status)
            ? query.Where(e => e.Status != Statuses.Employee.Archived)
            : query.Where(e => e.Status == input.Status.Trim().ToUpper());

        var placements = EffectiveJobPositions.Resolve(_context, query.AsNoTracking());
        var positionId = input.PositionId ?? input.JobPositionId;
        if (positionId.HasValue)
            placements = placements.Where(row => row.PositionId == positionId.Value);
        var totalItems = await placements.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var items = await placements
            .OrderBy(row => row.Employee.EmployeeCode)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(row => new EmployeeListItem
            {
                Id = row.Employee.Id,
                OrganizationId = row.Employee.OrganizationId,
                UserId = row.Employee.UserId,
                DepartmentId = row.Employee.DepartmentId,
                DepartmentName = _context.Departments
                    .Where(d => d.Id == row.Employee.DepartmentId)
                    .Select(d => d.Name)
                    .FirstOrDefault(),
                JobPositionId = row.PositionId,
                PositionName = _context.JobPositions
                    .Where(p => p.Id == row.PositionId)
                    .Select(p => p.Name)
                    .FirstOrDefault(),
                DirectManagerId = row.Employee.DirectManagerId,
                DirectManagerName = _context.Employees
                    .Where(m => m.Id == row.Employee.DirectManagerId)
                    .Select(m => m.FullName)
                    .FirstOrDefault(),
                EmployeeCode = row.Employee.EmployeeCode,
                FullName = row.Employee.FullName,
                WorkEmail = row.Employee.WorkEmail,
                Phone = row.Employee.Phone,
                Status = row.Employee.Status,
                JoinedAt = row.Employee.JoinedAt,
                CreatedAt = row.Employee.CreatedAt,
                UpdatedAt = row.Employee.UpdatedAt,
            })
            .ToListAsync();

        return new GetPagedEmployeesUseCaseOutput
        {
            Items = items,
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalItems = totalItems,
        };
    }
}
