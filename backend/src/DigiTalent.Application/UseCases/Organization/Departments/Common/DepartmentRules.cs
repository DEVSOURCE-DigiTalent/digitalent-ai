using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Rules and read helpers shared by the department use cases.
/// </summary>
public static class DepartmentRules
{
    /// <summary>The manager (departments.manager_employee_id) must be an ACTIVE employee of the same organization.</summary>
    public static async Task EnsureValidManagerAsync(IApplicationDbContext context, Guid organizationId, Guid managerEmployeeId)
    {
        var isActiveEmployee = await context.Employees.AnyAsync(e =>
            e.Id == managerEmployeeId && e.OrganizationId == organizationId && e.Status == Statuses.Employee.Active);
        if (!isActiveEmployee)
        {
            throw new BadRequestException("Manager must be an active employee of the organization.", "managerEmployeeId", "INVALID_MANAGER");
        }
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
