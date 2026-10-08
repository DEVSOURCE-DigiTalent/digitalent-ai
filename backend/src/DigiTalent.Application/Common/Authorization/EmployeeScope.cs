using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Authorization;

/// <summary>
/// Phạm vi nhân viên mà người gọi được xem/thao tác (spec D-S3-06):
///   OWNER   → toàn tổ chức
///   MANAGER → nhân viên cùng phòng ban (chưa tính phòng con — Sprint 5)
///   vai trò khác             → chỉ bản thân
/// Ngoài phạm vi → 404, không phân biệt với "không tồn tại" để tránh lộ dữ liệu.
/// </summary>
public class EmployeeScope
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public EmployeeScope(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public IQueryable<Employee> VisibleEmployees()
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var employees = _context.Employees.Where(e => e.OrganizationId == organizationId);

        // IsAdmin means organization OWNER (see CurrentUser).
        if (_currentUser.IsAdmin)
        {
            return employees;
        }

        if (_currentUser.IsDepartmentManager && _currentUser.DepartmentId.HasValue)
        {
            var departmentId = _currentUser.DepartmentId.Value;
            return employees.Where(e => e.DepartmentId == departmentId);
        }

        var ownEmployeeId = _currentUser.EmployeeId;
        return ownEmployeeId.HasValue
            ? employees.Where(e => e.Id == ownEmployeeId.Value)
            : employees.Where(_ => false);
    }

    public async Task<Employee> GetVisibleEmployeeAsync(Guid employeeId)
    {
        return await VisibleEmployees().FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new NotFoundException($"Employee with ID '{employeeId}' not found.");
    }
}
