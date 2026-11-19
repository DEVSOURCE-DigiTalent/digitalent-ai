using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.GetCapabilityProgress;

/// <summary>
/// "Khoảng trống năng lực" once the organization uses the platform for real: the gaps of every employee and department
/// now, and how far they closed since the survey. Per employee and domain:
///   - required = the level the owner set for the employee's department, else the position standard (as the survey);
///   - at survey = the survey result (<see cref="EmployeeDomainLevels.Baseline"/>);
///   - now = the highest of that result, the courses completed and the confirmed practical evidence.
/// A gap counts missing levels (required 3, level 1 → 2). Only domains with a survey result are compared, so "before"
/// and "now" cover the same people; employees without a result are listed as not surveyed.
/// </summary>
public sealed class GetCapabilityProgressUseCase(
    IApplicationDbContext context,
    ICurrentUser user,
    EmployeeScope scope,
    PulseCatalogReader catalog) : IUseCase<GetCapabilityProgressInput, GetCapabilityProgressOutput>
{
    private static readonly string[] DomainCodes = ["TT02_D1", "TT02_D2", "TT02_D3", "TT02_D4", "TT02_D5", "TT02_D6"];

    public async Task<GetCapabilityProgressOutput> ExecuteAsync(GetCapabilityProgressInput input)
    {
        var organizationId = user.GetRequiredOrganizationId();
        var query = scope.VisibleEmployees().AsNoTracking().Where(e => e.Status == Statuses.Employee.Active);
        if (input.DepartmentId is Guid departmentId) query = query.Where(e => e.DepartmentId == departmentId);
        var placements = await EffectiveJobPositions.Resolve(context, query)
            .OrderBy(row => row.Employee.FullName).ThenBy(row => row.Employee.Id).ToListAsync();

        var positions = await context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active)
            .ToDictionaryAsync(p => p.Id);
        var categories = (await context.CompetencyCategories.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && DomainCodes.Contains(c.Code))
                .Select(c => new { c.Id, c.Code, c.Name }).ToListAsync())
            .Select(c => new Domain(c.Id, int.Parse(c.Code[^1..]), PulseLearnerReader.DisplayName(c.Name)))
            .OrderBy(c => c.Number).ToList();
        var categoryIds = categories.Select(c => c.Id).ToList();
        var employeeIds = placements.Select(row => row.Employee.Id).ToList();
        var positionIds = placements.Where(row => row.PositionId is Guid id && positions.ContainsKey(id))
            .Select(row => row.PositionId!.Value).Distinct().ToList();
        var targets = await new PositionTargetsReader(context).LoadAsync(organizationId, positionIds);
        var levels = await new EmployeeDomainLevelsReader(context, catalog).LoadAsync(organizationId, employeeIds, categoryIds);
        var departments = await context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == organizationId).ToDictionaryAsync(d => d.Id, d => d.Name);

        var people = placements.Select(row =>
        {
            var employee = row.Employee;
            var position = row.PositionId is Guid id ? positions.GetValueOrDefault(id) : null;
            var standard = position == null ? null : targets.GetValueOrDefault(position.Id);
            var domains = categories.Select(category =>
            {
                // the position level set in Khung năng lực số, else the position standard (system suggestion)
                var required = standard?.Levels.GetValueOrDefault(category.Id) ?? 0;
                int? atSurvey = levels.Baseline.TryGetValue((employee.Id, category.Id), out var before) ? before : null;
                int? now = atSurvey == null ? null : levels.Current.GetValueOrDefault((employee.Id, category.Id), atSurvey.Value);
                return new CapabilityProgressEmployeeDomain(category.Id, category.Number, category.Name, required, atSurvey, now);
            }).Where(d => d.Required > 0).ToList();
            var compared = domains.Where(d => d.AtSurvey != null).ToList();
            return new CapabilityProgressEmployee(
                employee.Id, employee.FullName, departments.GetValueOrDefault(employee.DepartmentId), position?.Name,
                employee.DepartmentId, compared.Count > 0,
                compared.Sum(d => Math.Max(0, d.Required - d.AtSurvey!.Value)),
                compared.Sum(d => Math.Max(0, d.Required - d.Now!.Value)),
                compared.Sum(d => d.Now!.Value - d.AtSurvey!.Value),
                domains);
        }).ToList();
        var assessed = people.Where(p => p.Assessed).ToList();

        var domainProgress = categories.Select(category =>
        {
            var rows = assessed.SelectMany(p => p.Domains).Where(d => d.CategoryId == category.Id && d.AtSurvey != null).ToList();
            return new CapabilityProgressDomain(category.Id, category.Number, category.Name,
                Average(rows.Select(d => d.Required)), Average(rows.Select(d => d.AtSurvey!.Value)), Average(rows.Select(d => d.Now!.Value)),
                rows.Count, rows.Count(d => d.AtSurvey < d.Required), rows.Count(d => d.Now < d.Required));
        }).ToList();

        var departmentProgress = people.GroupBy(p => p.DepartmentId)
            .Select(group =>
            {
                var surveyed = group.Where(p => p.Assessed).ToList();
                return new CapabilityProgressDepartment(group.Key, departments.GetValueOrDefault(group.Key) ?? "—", group.Count(), surveyed.Count,
                    surveyed.Sum(p => p.GapsAtSurvey), surveyed.Sum(p => p.GapsNow), surveyed.Count(p => p.GapsNow > 0),
                    categories.Select(category =>
                    {
                        var rows = surveyed.SelectMany(p => p.Domains).Where(d => d.CategoryId == category.Id && d.AtSurvey != null).ToList();
                        return new CapabilityProgressDepartmentDomain(category.Number, rows.Count, rows.Count(d => d.Now < d.Required));
                    }).ToList());
            })
            .OrderByDescending(d => d.GapsNow).ThenByDescending(d => d.Employees).ThenBy(d => d.Name).ToList();

        var totals = new CapabilityProgressTotals(
            assessed.Sum(p => p.GapsAtSurvey), assessed.Sum(p => p.GapsNow),
            assessed.Count(p => p.GapsAtSurvey > 0), assessed.Count(p => p.GapsNow > 0), assessed.Count(p => p.GapsNow == 0));

        return new GetCapabilityProgressOutput(
            levels.SurveyedAt.Count == 0 ? null : levels.SurveyedAt.Values.Max(),
            people.Count, assessed.Count, totals, domainProgress, departmentProgress,
            people.OrderBy(p => p.Assessed ? 0 : 1).ThenByDescending(p => p.GapsNow).ThenBy(p => p.Name).ToList());
    }

    private static decimal? Average(IEnumerable<int> values)
    {
        var list = values.ToList();
        return list.Count == 0 ? null : Math.Round(list.Average(v => (decimal)v), 2);
    }

    private sealed record Domain(Guid Id, int Number, string Name);
}
