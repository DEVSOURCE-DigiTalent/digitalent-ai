using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

/// <summary>
/// Skill gap overview (OW-21): totals of the latest snapshots of the analysed employees in scope, and the same figures
/// per department, position or grade (organization's grade names), weakest coverage first.
/// </summary>
public class GetGapOverviewUseCase : IUseCase<GetGapOverviewUseCaseInput, GetGapOverviewUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly AnalyzedEmployees _analyzedEmployees;

    public GetGapOverviewUseCase(IApplicationDbContext context, ICurrentUser currentUser, AnalyzedEmployees analyzedEmployees)
    {
        _context = context;
        _currentUser = currentUser;
        _analyzedEmployees = analyzedEmployees;
    }

    public async Task<GetGapOverviewUseCaseOutput> ExecuteAsync(GetGapOverviewUseCaseInput input)
    {
        var groupBy = input.GroupBy?.ToLowerInvariant() ?? GapGroupings.Department;
        var analyzed = await _analyzedEmployees.LoadAsync(input);

        var groups = (await LoadGroupKeysAsync(groupBy))
            .Select(key => Fill(analyzed.Where(key.Contains).ToList(), new GapGroup { Id = key.Id, Name = key.Name }))
            .Where(group => group.Employees > 0)
            .OrderBy(group => group.AverageCoverage)
            .ToList();

        return new GetGapOverviewUseCaseOutput
        {
            GroupBy = groupBy,
            Totals = Fill(analyzed, new GapStats()),
            Groups = groups,
        };
    }

    private async Task<List<GroupKey>> LoadGroupKeysAsync(string groupBy)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        switch (groupBy)
        {
            case GapGroupings.Position:
                var positions = await _context.JobPositions
                    .AsNoTracking()
                    .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active)
                    .OrderBy(p => p.Name)
                    .Select(p => new { p.Id, p.Name })
                    .ToListAsync();
                return positions.Select(p => new GroupKey(p.Id.ToString(), p.Name, e => e.JobPositionId == p.Id)).ToList();

            case GapGroupings.Grade:
                var names = await JobGradeNames.LoadAsync(_context, organizationId);
                return JobGrades.Codes.Select(code => new GroupKey(code, names.NameOf(code) ?? code, e => e.JobGrade == code)).ToList();

            default:
                var departments = await _context.Departments
                    .AsNoTracking()
                    .Where(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active)
                    .OrderBy(d => d.Name)
                    .Select(d => new { d.Id, d.Name })
                    .ToListAsync();
                return departments.Select(d => new GroupKey(d.Id.ToString(), d.Name, e => e.DepartmentId == d.Id)).ToList();
        }
    }

    private static T Fill<T>(List<AnalyzedEmployee> employees, T stats) where T : GapStats
    {
        var summaries = employees.Select(e => e.Run.Summary).ToList();
        stats.Employees = employees.Count;
        stats.AverageCoverage = employees.Count == 0 ? 0 : Math.Round(summaries.Average(s => s?.CoveragePercent ?? 0), 2);
        stats.TotalGaps = employees.Sum(e => e.Run.GapCount);
        stats.HighCount = summaries.Sum(s => s?.HighCount ?? 0);
        stats.MediumCount = summaries.Sum(s => s?.MediumCount ?? 0);
        stats.LowCount = summaries.Sum(s => s?.LowCount ?? 0);
        stats.EmployeesWithHigh = summaries.Count(s => s?.HighCount > 0);
        return stats;
    }

    private sealed record GroupKey(string Id, string Name, Func<AnalyzedEmployee, bool> Contains);
}
