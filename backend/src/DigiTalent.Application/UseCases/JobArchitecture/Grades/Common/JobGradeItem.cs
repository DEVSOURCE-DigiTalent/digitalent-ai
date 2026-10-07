using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// One grade of the shared scale with its usage (frontend services/job-grade.service.ts JobGradeItem).
/// </summary>
public class JobGradeItem
{
    public string Code { get; set; } = string.Empty; // G1 | G2 | G3
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>True when the organization renamed the grade (a job_grades row exists).</summary>
    public bool IsCustomized { get; set; }

    /// <summary>ACTIVE positions on this grade.</summary>
    public int PositionCount { get; set; }

    /// <summary>ACTIVE employees whose position is on this grade.</summary>
    public int EmployeeCount { get; set; }
}

/// <summary>
/// Reads the grade scale of an organization: stored names over defaults, plus position/employee counts.
/// </summary>
public static class JobGradeReader
{
    public static async Task<List<JobGradeItem>> ReadAsync(IApplicationDbContext context, Guid organizationId)
    {
        var custom = await context.JobGrades
            .Where(g => g.OrganizationId == organizationId)
            .ToDictionaryAsync(g => g.Code);

        var positionCounts = await context.JobPositions
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active && p.JobGrade != null)
            .GroupBy(p => p.JobGrade!)
            .Select(g => new { Code = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Code, x => x.Count);

        var employeeCounts = await (
                from employee in context.Employees
                join position in context.JobPositions on employee.JobPositionId equals position.Id
                where employee.OrganizationId == organizationId
                      && employee.Status == Statuses.Employee.Active
                      && position.JobGrade != null
                group employee by position.JobGrade into g
                select new { Code = g.Key!, Count = g.Count() })
            .ToDictionaryAsync(x => x.Code, x => x.Count);

        return JobGrades.Codes.Select(code =>
        {
            var stored = custom.GetValueOrDefault(code);
            var defaults = JobGrades.Defaults[code];
            return new JobGradeItem
            {
                Code = code,
                Name = stored?.Name ?? defaults.Name,
                Description = stored != null ? stored.Description : defaults.Description,
                IsCustomized = stored != null,
                PositionCount = positionCounts.GetValueOrDefault(code),
                EmployeeCount = employeeCounts.GetValueOrDefault(code),
            };
        }).ToList();
    }
}
