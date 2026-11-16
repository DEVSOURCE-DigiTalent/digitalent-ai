using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Rules and read helpers shared by the department use cases.
/// </summary>
public static class DepartmentRules
{
    public static async Task AssignManagerAsync(IApplicationDbContext context, Department department, Guid employeeId, Guid? actorId, bool requireDepartmentMembership)
    {
        var employee = await context.Employees.FirstOrDefaultAsync(e =>
            e.Id == employeeId && e.OrganizationId == department.OrganizationId
            && e.Status == Statuses.Employee.Active && e.UserId.HasValue);
        if (employee == null || (requireDepartmentMembership && employee.DepartmentId != department.Id))
            throw new BadRequestException("Chọn nhân sự đang hoạt động và có tài khoản hợp lệ để làm trưởng phòng.", "managerEmployeeId", "INVALID_MANAGER");

        if (await context.Departments.AnyAsync(d => d.OrganizationId == department.OrganizationId
            && d.Id != department.Id && d.ManagerEmployeeId == employeeId && d.Status != Statuses.MasterData.Archived))
            throw new ConflictException("Nhân sự đã là trưởng phòng của phòng ban khác.");

        var managerRoleId = await context.Roles.Where(r => r.Code == Roles.Manager).Select(r => r.Id).SingleAsync();
        if (await context.MemberInvitations.AnyAsync(i => i.DepartmentId == department.Id
            && i.RoleId == managerRoleId && i.Status == Statuses.MemberInvitation.Pending && i.ExpiresAt > DateTimeOffset.UtcNow))
            throw new ConflictException("Phòng ban đã có lời mời trưởng phòng đang chờ kích hoạt.");

        // Persist the new department after validation, before writing the two references.
        if (!requireDepartmentMembership)
            await context.SaveChangesAsync();

        var userId = employee.UserId!.Value;
        var employeeRoleId = await context.Roles.Where(r => r.Code == Roles.Employee).Select(r => r.Id).SingleAsync();
        var requiredRoles = new[] { managerRoleId, employeeRoleId };
        var assignedRoles = await context.UserRoles.Where(r => r.UserId == userId && requiredRoles.Contains(r.RoleId))
            .Select(r => r.RoleId).ToListAsync();
        foreach (var roleId in requiredRoles.Except(assignedRoles))
            context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId, AssignedByUserId = actorId, AssignedAt = DateTimeOffset.UtcNow });

        if (employee.DepartmentId != department.Id)
        {
            employee.DepartmentId = department.Id;
            // A new department does not own the position from the manager's former department.
            employee.JobPositionId = null;
        }
        employee.DirectManagerId = null;
        department.ManagerEmployeeId = employeeId;
        var members = await context.Employees.Where(e => e.DepartmentId == department.Id && e.Status != Statuses.Employee.Archived).ToListAsync();
        foreach (var member in members)
            member.DirectManagerId = member.Id == employeeId ? null : employeeId;
    }

    public static async Task EnsureManagerCanChangePlacementAsync(IApplicationDbContext context, Guid employeeId, Guid organizationId)
    {
        if (await context.Departments.AnyAsync(d => d.OrganizationId == organizationId
            && d.ManagerEmployeeId == employeeId && d.Status != Statuses.MasterData.Archived))
            throw new ConflictException("Nhân sự đang là trưởng phòng. Cần xử lý phân công trưởng phòng trước khi thay đổi hồ sơ.");
    }

    public static async Task<Guid?> ResolveDirectManagerAsync(IApplicationDbContext context, Guid departmentId,
        Guid? requestedManagerId, Guid? employeeId = null)
    {
        var managerId = await (
                from department in context.Departments
                join manager in context.Employees on department.ManagerEmployeeId equals manager.Id
                where department.Id == departmentId && manager.DepartmentId == department.Id
                    && manager.OrganizationId == department.OrganizationId && manager.Status == Statuses.Employee.Active
                select (Guid?)manager.Id)
            .SingleOrDefaultAsync();
        var directManagerId = managerId == employeeId ? null : managerId;
        if (requestedManagerId.HasValue && requestedManagerId != directManagerId)
            throw new BadRequestException("Quản lý trực tiếp phải là trưởng phòng của phòng ban đã chọn.", "directManagerId", "INVALID_MANAGER");
        return directManagerId;
    }

    /// <summary>
    /// Headcount (ACTIVE employees) and grade distribution ({ "G1": n, "G2": n, "G3": n }, by the grade of each
    /// employee's position) of the given departments. Departments without employees get 0 and zero counts.
    /// </summary>
    public static async Task<Dictionary<Guid, DepartmentStats>> LoadStatsAsync(IApplicationDbContext context, IReadOnlyCollection<Guid> departmentIds)
    {
        var rows = await (
                from employee in context.Employees
                where departmentIds.Contains(employee.DepartmentId) && employee.Status == Statuses.Employee.Active
                join position in context.JobPositions on employee.JobPositionId equals position.Id into positions
                from position in positions.DefaultIfEmpty()
                group employee by new { employee.DepartmentId, Grade = position.JobGrade } into g
                select new { g.Key.DepartmentId, g.Key.Grade, Count = g.Count() })
            .ToListAsync();

        return departmentIds.Distinct().ToDictionary(id => id, id =>
        {
            var departmentRows = rows.Where(r => r.DepartmentId == id).ToList();
            return new DepartmentStats
            {
                Headcount = departmentRows.Sum(r => r.Count),
                GradeDistribution = JobGrades.Codes.ToDictionary(
                    code => code,
                    code => departmentRows.Where(r => r.Grade == code).Sum(r => r.Count)),
            };
        });
    }
}

/// <summary>
/// Headcount and grade distribution of one department.
/// </summary>
public class DepartmentStats
{
    public int Headcount { get; set; }
    public Dictionary<string, int> GradeDistribution { get; set; } = new();
}
