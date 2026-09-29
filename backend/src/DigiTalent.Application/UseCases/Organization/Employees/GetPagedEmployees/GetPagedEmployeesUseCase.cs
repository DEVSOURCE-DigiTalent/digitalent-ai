using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
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

        var positionId = input.PositionId ?? input.JobPositionId;
        if (positionId.HasValue)
        {
            query = query.Where(e => e.JobPositionId == positionId.Value);
        }

        query = string.IsNullOrWhiteSpace(input.Status)
            ? query.Where(e => e.Status != Statuses.Employee.Archived)
            : query.Where(e => e.Status == input.Status.Trim().ToUpper());

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = input.PageSize < 1 ? 20 : input.PageSize;

        var items = await query
            .OrderBy(e => e.EmployeeCode)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EmployeeListItem
            {
                Id = e.Id,
                OrganizationId = e.OrganizationId,
                UserId = e.UserId,
                DepartmentId = e.DepartmentId,
                DepartmentName = _context.Departments
                    .Where(d => d.Id == e.DepartmentId)
                    .Select(d => d.Name)
                    .FirstOrDefault(),
                JobPositionId = e.JobPositionId,
                PositionName = _context.JobPositions
                    .Where(p => p.Id == e.JobPositionId)
                    .Select(p => p.Name)
                    .FirstOrDefault(),
                DirectManagerId = e.DirectManagerId,
                DirectManagerName = _context.Employees
                    .Where(m => m.Id == e.DirectManagerId)
                    .Select(m => m.FullName)
                    .FirstOrDefault(),
                EmployeeCode = e.EmployeeCode,
                FullName = e.FullName,
                WorkEmail = e.WorkEmail,
                Phone = e.Phone,
                Status = e.Status,
                JoinedAt = e.JoinedAt,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
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
