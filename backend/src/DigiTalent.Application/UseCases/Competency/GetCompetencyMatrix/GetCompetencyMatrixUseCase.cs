using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

/// <summary>
/// Competency matrix (OW-19, MG-04): active employees in the caller's scope × the organization's Circular 02/2025
/// competencies, each cell holding the confirmed level, the level the position requires and the gap.
/// </summary>
public class GetCompetencyMatrixUseCase : IUseCase<GetCompetencyMatrixUseCaseInput, GetCompetencyMatrixUseCaseOutput>
{
    private const string Confirmed = "CONFIRMED";

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly LatestSkillGapRuns _latestRuns;

    public GetCompetencyMatrixUseCase(
        IApplicationDbContext context, ICurrentUser currentUser, EmployeeScope employeeScope, LatestSkillGapRuns latestRuns)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _latestRuns = latestRuns;
    }

    public async Task<GetCompetencyMatrixUseCaseOutput> ExecuteAsync(GetCompetencyMatrixUseCaseInput input)
    {
        var competencies = await LoadColumnsAsync(input.CategoryId);
        var categoryIds = competencies.Select(c => c.CategoryId).ToHashSet();
        var categories = await _context.CompetencyCategories
            .AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .OrderBy(c => c.SortOrder)
            .Select(c => new CompetencyMatrixCategory { Id = c.Id, Code = c.Code, Name = c.Name, SortOrder = c.SortOrder })
            .ToListAsync();

        var employees = await LoadEmployeesAsync(input);
        var employeeIds = employees.Select(e => e.EmployeeId).ToList();
        var required = await LoadRequiredLevelsAsync(employees.Where(e => e.JobPositionId != null).Select(e => e.JobPositionId!.Value).Distinct().ToList());
        var held = await LoadConfirmedLevelsAsync(employeeIds);
        var runs = await _latestRuns.LoadAsync(employeeIds);

        foreach (var employee in employees)
        {
            employee.CoveragePercent = runs.TryGetValue(employee.EmployeeId, out var run) ? run.Summary?.CoveragePercent : null;
            foreach (var competency in competencies)
            {
                var requiredLevel = employee.JobPositionId != null
                    && required.TryGetValue((employee.JobPositionId.Value, competency.Id), out var level) ? level : 0;
                held.TryGetValue((employee.EmployeeId, competency.Id), out var confirmed);
                var cell = new MatrixCell
                {
                    CurrentLevel = confirmed?.Level ?? 0,
                    RequiredLevel = requiredLevel,
                    EvidenceSource = EvidenceSources.ToApi(confirmed?.SourceType),
                    EvidenceStatus = confirmed != null ? Confirmed : "NONE",
                    ConfirmedAt = confirmed?.ConfirmedAt,
                };
                cell.Gap = Math.Max(0, cell.RequiredLevel - cell.CurrentLevel);
                employee.Cells[competency.Id.ToString()] = cell;
            }

            employee.TotalGaps = employee.Cells.Values.Count(cell => cell.Gap > 0);
        }

        return new GetCompetencyMatrixUseCaseOutput { Categories = categories, Competencies = competencies, Employees = employees };
    }

    /// <summary>Active competencies of the organization mapped to Circular 02/2025, in domain then framework code order.</summary>
    private async Task<List<CompetencyMatrixCompetency>> LoadColumnsAsync(Guid? categoryId)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var tt02 = Tt02Mappings.Query(_context);
        var columns = await (
                from competency in _context.Competencies.AsNoTracking()
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where category.OrganizationId == organizationId
                      && competency.Status == Statuses.Competency.Active
                      && (categoryId == null || category.Id == categoryId)
                let frameworkCode = tt02.Where(m => m.CompetencyId == competency.Id).Select(m => m.SourceCode).FirstOrDefault()
                where frameworkCode != null
                select new { category.SortOrder, Column = new CompetencyMatrixCompetency
                {
                    Id = competency.Id,
                    Code = competency.Code,
                    FrameworkCode = frameworkCode,
                    Name = competency.Name,
                    CategoryId = category.Id,
                } })
            .ToListAsync();

        return columns
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Column.FrameworkCode, FrameworkCodeComparer.Instance)
            .Select(c => c.Column)
            .ToList();
    }

    private async Task<List<MatrixEmployee>> LoadEmployeesAsync(GetCompetencyMatrixUseCaseInput input)
    {
        var employees = _employeeScope.VisibleEmployees().Where(e => e.Status == Statuses.Employee.Active);
        if (input.DepartmentId.HasValue)
        {
            employees = employees.Where(e => e.DepartmentId == input.DepartmentId.Value);
        }

        if (input.JobPositionId.HasValue)
        {
            employees = employees.Where(e => e.JobPositionId == input.JobPositionId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            employees = employees.Where(e => e.FullName.ToLower().Contains(keyword) || e.EmployeeCode.ToLower().Contains(keyword));
        }

        var grade = input.JobGrade?.Trim().ToUpperInvariant();
        var rows = await (
                from employee in employees.AsNoTracking()
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                join position in _context.JobPositions.AsNoTracking() on employee.JobPositionId equals position.Id into positions
                from position in positions.DefaultIfEmpty()
                where grade == null || (position != null && position.JobGrade == grade)
                select new MatrixEmployee
                {
                    EmployeeId = employee.Id,
                    EmployeeCode = employee.EmployeeCode,
                    FullName = employee.FullName,
                    DepartmentId = employee.DepartmentId,
                    DepartmentName = department.Name,
                    JobPositionId = employee.JobPositionId,
                    JobPositionName = position != null ? position.Name : null,
                    JobGrade = position != null ? position.JobGrade : null,
                })
            .ToListAsync();

        return rows.OrderBy(e => e.FullName, NameOrder.Vietnamese).ToList();
    }

    /// <summary>Required level per (position, competency) from the ACTIVE requirement set of each position.</summary>
    private async Task<Dictionary<(Guid PositionId, Guid CompetencyId), int>> LoadRequiredLevelsAsync(List<Guid> positionIds)
    {
        var items = await (
                from item in _context.PositionRequirementItems.AsNoTracking()
                join set in _context.PositionRequirementSets.AsNoTracking() on item.RequirementSetId equals set.Id
                where positionIds.Contains(set.JobPositionId) && set.Status == Statuses.PositionRequirementSet.Active
                select new { set.JobPositionId, item.CompetencyId, item.RequiredLevel })
            .ToListAsync();
        return items.ToDictionary(i => (i.JobPositionId, i.CompetencyId), i => i.RequiredLevel);
    }

    private async Task<Dictionary<(Guid EmployeeId, Guid CompetencyId), ConfirmedLevel>> LoadConfirmedLevelsAsync(List<Guid> employeeIds)
    {
        var profiles = await (
                from profile in _context.EmployeeCompetencyProfiles.AsNoTracking()
                join evidence in _context.CompetencyEvidences.AsNoTracking() on profile.LatestConfirmingEvidenceId equals evidence.Id into evidences
                from evidence in evidences.DefaultIfEmpty()
                where employeeIds.Contains(profile.EmployeeId)
                select new
                {
                    profile.EmployeeId,
                    profile.CompetencyId,
                    Level = new ConfirmedLevel(profile.ConfirmedLevel, evidence != null ? evidence.SourceType : null, profile.ConfirmedAt),
                })
            .ToListAsync();
        return profiles.ToDictionary(p => (p.EmployeeId, p.CompetencyId), p => p.Level);
    }

    private sealed record ConfirmedLevel(short Level, string? SourceType, DateTimeOffset ConfirmedAt);
}
