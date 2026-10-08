using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

/// <summary>Filters shared by the skill gap analytics (frontend AnalyticsFilter).</summary>
public class SkillGapAnalyticsFilter
{
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }

    /// <summary>Grade of the employee's position: G1 / G2 / G3.</summary>
    public string? JobGrade { get; set; }
}

/// <summary>An active employee in scope that has a skill gap snapshot.</summary>
public sealed record AnalyzedEmployee(Guid EmployeeId, Guid DepartmentId, Guid? JobPositionId, string? JobGrade, LatestSkillGapRun Run);

/// <summary>
/// Population of the skill gap analytics (OW-21, OW-40): active employees in the caller's scope matching the filter,
/// each with the latest snapshot. Employees never analysed are left out, as their gaps are unknown.
/// </summary>
public class AnalyzedEmployees
{
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _employeeScope;
    private readonly LatestSkillGapRuns _latestRuns;

    public AnalyzedEmployees(IApplicationDbContext context, EmployeeScope employeeScope, LatestSkillGapRuns latestRuns)
    {
        _context = context;
        _employeeScope = employeeScope;
        _latestRuns = latestRuns;
    }

    public async Task<List<AnalyzedEmployee>> LoadAsync(SkillGapAnalyticsFilter filter)
    {
        var employees = _employeeScope.VisibleEmployees().Where(e => e.Status == Statuses.Employee.Active);
        if (filter.DepartmentId.HasValue)
        {
            employees = employees.Where(e => e.DepartmentId == filter.DepartmentId.Value);
        }

        if (filter.JobPositionId.HasValue)
        {
            employees = employees.Where(e => e.JobPositionId == filter.JobPositionId.Value);
        }

        var people = await (
                from employee in employees.AsNoTracking()
                join position in _context.JobPositions.AsNoTracking() on employee.JobPositionId equals position.Id into positions
                from position in positions.DefaultIfEmpty()
                select new
                {
                    employee.Id,
                    employee.DepartmentId,
                    employee.JobPositionId,
                    JobGrade = position != null ? position.JobGrade : null,
                })
            .ToListAsync();
        if (!string.IsNullOrWhiteSpace(filter.JobGrade))
        {
            var grade = filter.JobGrade.Trim().ToUpperInvariant();
            people = people.Where(p => p.JobGrade == grade).ToList();
        }

        var runs = await _latestRuns.LoadAsync(people.Select(p => p.Id).ToList());
        return people
            .Where(p => runs.ContainsKey(p.Id))
            .Select(p => new AnalyzedEmployee(p.Id, p.DepartmentId, p.JobPositionId, p.JobGrade, runs[p.Id]))
            .ToList();
    }
}
