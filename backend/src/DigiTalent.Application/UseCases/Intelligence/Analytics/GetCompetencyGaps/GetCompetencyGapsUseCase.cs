using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

/// <summary>
/// Gap per competency (OW-21, OW-40) over the latest snapshots of the analysed employees in scope: how many are
/// required to hold it, how many fall short and how badly, and the average required vs current level.
/// </summary>
public class GetCompetencyGapsUseCase : IUseCase<GetCompetencyGapsUseCaseInput, GetCompetencyGapsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly AnalyzedEmployees _analyzedEmployees;

    public GetCompetencyGapsUseCase(IApplicationDbContext context, AnalyzedEmployees analyzedEmployees)
    {
        _context = context;
        _analyzedEmployees = analyzedEmployees;
    }

    public async Task<GetCompetencyGapsUseCaseOutput> ExecuteAsync(GetCompetencyGapsUseCaseInput input)
    {
        var runIds = (await _analyzedEmployees.LoadAsync(input)).Select(e => e.Run.RunId).ToList();
        var output = new GetCompetencyGapsUseCaseOutput();
        if (runIds.Count == 0)
        {
            return output;
        }

        var tt02 = Tt02Mappings.Query(_context);
        var items = await (
                from item in _context.SkillGapItems.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where runIds.Contains(item.SkillGapRunId)
                select new
                {
                    item.CompetencyId,
                    competency.Name,
                    CategoryName = category.Name,
                    FrameworkCode = tt02.Where(m => m.CompetencyId == competency.Id).Select(m => m.SourceCode).FirstOrDefault(),
                    item.RequiredLevel,
                    item.CurrentLevel,
                    item.GapSteps,
                    item.Severity,
                })
            .ToListAsync();

        output.AddRange(items
            .GroupBy(item => item.CompetencyId)
            .Select(group =>
            {
                var first = group.First();
                return new CompetencyGapRow
                {
                    CompetencyId = group.Key,
                    FrameworkCode = first.FrameworkCode ?? string.Empty,
                    Name = first.Name,
                    CategoryName = first.CategoryName,
                    EmployeesRequired = group.Count(),
                    EmployeesWithGap = group.Count(i => i.GapSteps > 0),
                    HighCount = group.Count(i => i.Severity == Statuses.SkillGapSeverity.High),
                    MediumCount = group.Count(i => i.Severity == Statuses.SkillGapSeverity.Medium),
                    LowCount = group.Count(i => i.Severity == Statuses.SkillGapSeverity.Low),
                    AverageRequiredLevel = Math.Round((decimal)group.Average(i => (double)i.RequiredLevel), 2),
                    AverageCurrentLevel = Math.Round((decimal)group.Average(i => (double)(i.CurrentLevel ?? 0)), 2),
                };
            })
            .OrderByDescending(row => row.HighCount)
            .ThenByDescending(row => row.EmployeesWithGap)
            .ThenBy(row => row.FrameworkCode, FrameworkCodeComparer.Instance));
        return output;
    }
}
