using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

/// <summary>
/// Builds <see cref="WorkforceRow"/>s for an already scoped employee query (EmployeeScope): employee fields, why a
/// skill gap cannot be calculated, the latest skill gap snapshot and course assignment counts.
/// </summary>
public class WorkforceReader
{
    private readonly IApplicationDbContext _context;
    private readonly LatestSkillGapRuns _latestRuns;

    public WorkforceReader(IApplicationDbContext context, LatestSkillGapRuns latestRuns)
    {
        _context = context;
        _latestRuns = latestRuns;
    }

    public async Task<List<WorkforceRow>> LoadRowsAsync(IQueryable<Employee> employees)
    {
        var people = await (
                from employee in employees.AsNoTracking()
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                join position in _context.JobPositions.AsNoTracking() on employee.JobPositionId equals position.Id into positions
                from position in positions.DefaultIfEmpty()
                join manager in _context.Employees.AsNoTracking() on employee.DirectManagerId equals manager.Id into managers
                from manager in managers.DefaultIfEmpty()
                select new
                {
                    Row = new WorkforceRow
                    {
                        Id = employee.Id,
                        OrganizationId = employee.OrganizationId,
                        UserId = employee.UserId,
                        DepartmentId = employee.DepartmentId,
                        DepartmentName = department.Name,
                        JobPositionId = employee.JobPositionId,
                        PositionName = position != null ? position.Name : null,
                        DirectManagerId = employee.DirectManagerId,
                        DirectManagerName = manager != null ? manager.FullName : null,
                        EmployeeCode = employee.EmployeeCode,
                        FullName = employee.FullName,
                        WorkEmail = employee.WorkEmail,
                        Phone = employee.Phone,
                        Status = employee.Status,
                        JoinedAt = employee.JoinedAt,
                        CreatedAt = employee.CreatedAt,
                        UpdatedAt = employee.UpdatedAt,
                    },
                    HasActiveRequirementSet = _context.PositionRequirementSets.Any(set =>
                        set.JobPositionId == employee.JobPositionId && set.Status == Statuses.PositionRequirementSet.Active),
                })
            .ToListAsync();
        if (people.Count == 0)
        {
            return new List<WorkforceRow>();
        }

        var ids = people.Select(p => p.Row.Id).ToList();
        var latestRuns = await _latestRuns.LoadAsync(ids);
        var courses = await LoadCourseCountsAsync(ids);

        foreach (var person in people)
        {
            var row = person.Row;
            row.Blocker = BlockerOf(row.Status, row.JobPositionId, person.HasActiveRequirementSet);

            if (latestRuns.TryGetValue(row.Id, out var run))
            {
                row.HasSnapshot = true;
                row.GapCount = run.GapCount;
                row.HighCount = run.Summary?.HighCount ?? 0;
                row.CoveragePercent = run.Summary?.CoveragePercent;
            }

            if (courses.TryGetValue(row.Id, out var count))
            {
                row.ActiveCourses = count.Active;
                row.CompletedCourses = count.Completed;
                row.OverdueCourses = count.Overdue;
            }
        }

        return people.Select(p => p.Row).ToList();
    }

    /// <summary>Same order of checks as the skill gap engine (SkillGapSkipReasons).</summary>
    public static string? BlockerOf(string employeeStatus, Guid? jobPositionId, bool hasActiveRequirementSet)
    {
        if (employeeStatus != Statuses.Employee.Active)
        {
            return SkillGapSkipReasons.EmployeeNotActive;
        }

        if (jobPositionId == null)
        {
            return SkillGapSkipReasons.NoJobPosition;
        }

        return hasActiveRequirementSet ? null : SkillGapSkipReasons.NoActiveRequirementSet;
    }

    private async Task<Dictionary<Guid, CourseCount>> LoadCourseCountsAsync(List<Guid> employeeIds)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var counts = await _context.CourseAssignments
            .AsNoTracking()
            .Where(assignment => employeeIds.Contains(assignment.EmployeeId) && assignment.Status != Statuses.Enrollment.Cancelled)
            .GroupBy(assignment => assignment.EmployeeId)
            .Select(group => new CourseCount(
                group.Key,
                group.Count(a => a.Status != Statuses.Enrollment.Completed),
                group.Count(a => a.Status == Statuses.Enrollment.Completed),
                group.Count(a => a.Status != Statuses.Enrollment.Completed && a.DueDate != null && a.DueDate < today)))
            .ToListAsync();

        return counts.ToDictionary(count => count.EmployeeId);
    }

    private sealed record CourseCount(Guid EmployeeId, int Active, int Completed, int Overdue);
}
