using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Authorization;

/// <summary>
/// Phạm vi nhân viên mà người gọi được xem/thao tác (spec D-S3-06):
///   OWNER   → toàn tổ chức
///   MANAGER → nhân viên thuộc các phòng ban được phân công trực tiếp
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

    public IQueryable<Employee> VisibleEmployees(bool includeSelf = false)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var employees = _context.Employees.Where(e => e.OrganizationId == organizationId);

        // IsAdmin means organization OWNER (see CurrentUser).
        if (_currentUser.IsAdmin)
        {
            return employees;
        }

        if (_currentUser.IsDepartmentManager)
        {
            var departmentIds = VisibleDepartments().Select(d => d.Id);
            var ownId = _currentUser.EmployeeId;
            return employees.Where(e => departmentIds.Contains(e.DepartmentId) || (includeSelf && e.Id == ownId));
        }

        var ownEmployeeId = _currentUser.EmployeeId;
        return ownEmployeeId.HasValue
            ? employees.Where(e => e.Id == ownEmployeeId.Value)
            : employees.Where(_ => false);
    }

    public IQueryable<Department> VisibleDepartments()
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var departments = _context.Departments.Where(d => d.OrganizationId == organizationId);
        if (!_currentUser.IsDepartmentManager || _currentUser.IsAdmin)
        {
            return departments;
        }

        var employeeId = _currentUser.EmployeeId;
        return departments.Where(d => employeeId != null && d.ManagerEmployeeId == employeeId
            && d.Status != Statuses.MasterData.Archived);
    }

    public async Task<Employee> GetVisibleEmployeeAsync(Guid employeeId, bool includeSelf = false)
    {
        return await VisibleEmployees(includeSelf).FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new NotFoundException($"Employee with ID '{employeeId}' not found.");
    }
}
