using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Services.Intelligence.SkillGap;

/// <summary>Kết quả dựng snapshot cho 1 nhân viên: có Run, hoặc có SkipReason.</summary>
public sealed record SkillGapStageOutcome(Employee Employee, SkillGapRun? Run, SkillGapResult? Result, string? SkipReason);

/// <summary>
/// Dựng snapshot skill gap (skill_gap_runs + skill_gap_items) và ADD vào DbContext — KHÔNG SaveChanges,
/// để use case / domain event handler quyết định transaction. Nạp dữ liệu theo lô (3 truy vấn cho cả danh sách).
/// Snapshot chỉ thêm mới, không ghi đè (spec D-S3-07).
/// </summary>
public class SkillGapRunService
{
    private readonly IApplicationDbContext _context;
    private readonly SkillGapSettingsProvider _settingsProvider;

    public SkillGapRunService(IApplicationDbContext context, SkillGapSettingsProvider settingsProvider)
    {
        _context = context;
        _settingsProvider = settingsProvider;
    }

    /// <param name="requirementSetOverride">
    /// Bộ tiêu chuẩn ACTIVE dùng thay cho bộ của vị trí hiện tại ("so với vị trí khác"); caller đã kiểm tra tổ chức.
    /// </param>
    public async Task<IReadOnlyList<SkillGapStageOutcome>> StageRunsAsync(
        IReadOnlyList<Employee> employees,
        Guid organizationId,
        string generatedBy,
        PositionRequirementSet? requirementSetOverride = null)
    {
        if (employees.Count == 0)
        {
            return Array.Empty<SkillGapStageOutcome>();
        }

        var settings = await _settingsProvider.GetAsync(organizationId);
        var setsByPosition = await LoadActiveSetsAsync(employees, requirementSetOverride);
        var setIds = requirementSetOverride != null
            ? new List<Guid> { requirementSetOverride.Id }
            : setsByPosition.Values.Select(s => s.Id).Distinct().ToList();
        var requirementsBySet = await LoadRequirementsAsync(setIds);
        var levelsByEmployee = await LoadConfirmedLevelsAsync(employees.Select(e => e.Id).ToList());
        var generatedAt = DateTimeOffset.UtcNow;

        return employees
            .Select(employee => Stage(employee, requirementSetOverride, setsByPosition, requirementsBySet, levelsByEmployee, settings, generatedBy, generatedAt))
            .ToList();
    }

    private SkillGapStageOutcome Stage(
        Employee employee,
        PositionRequirementSet? requirementSetOverride,
        IReadOnlyDictionary<Guid, PositionRequirementSet> setsByPosition,
        IReadOnlyDictionary<Guid, List<SkillGapRequirementLine>> requirementsBySet,
        IReadOnlyDictionary<Guid, Dictionary<Guid, short>> levelsByEmployee,
        SkillGapSettings settings,
        string generatedBy,
        DateTimeOffset generatedAt)
    {
        if (employee.Status != Statuses.Employee.Active)
        {
            return Skip(employee, SkillGapSkipReasons.EmployeeNotActive);
        }

        var set = requirementSetOverride;
        if (set == null)
        {
            if (employee.JobPositionId == null)
            {
                return Skip(employee, SkillGapSkipReasons.NoJobPosition);
            }

            if (!setsByPosition.TryGetValue(employee.JobPositionId.Value, out set))
            {
                return Skip(employee, SkillGapSkipReasons.NoActiveRequirementSet);
            }
        }

        var requirements = requirementsBySet.GetValueOrDefault(set.Id) ?? new List<SkillGapRequirementLine>();
        var confirmedLevels = levelsByEmployee.GetValueOrDefault(employee.Id) ?? new Dictionary<Guid, short>();
        var result = SkillGapCalculator.Calculate(requirements, confirmedLevels, settings);

        var run = BuildRun(employee, set, result, settings, generatedBy, generatedAt);
        _context.SkillGapRuns.Add(run);
        _context.SkillGapItems.AddRange(result.Items.Select(line => BuildItem(run.Id, line)));

        return new SkillGapStageOutcome(employee, run, result, null);
    }

    private static SkillGapStageOutcome Skip(Employee employee, string reason) => new(employee, null, null, reason);

    private static SkillGapRun BuildRun(
        Employee employee,
        PositionRequirementSet set,
        SkillGapResult result,
        SkillGapSettings settings,
        string generatedBy,
        DateTimeOffset generatedAt)
    {
        var summary = result.Summary;
        var snapshot = new SkillGapSnapshot(
            set.JobPositionId,
            set.VersionNo,
            summary.TotalRequired,
            summary.TotalMet,
            summary.TotalGap,
            summary.HighCount,
            summary.MediumCount,
            summary.LowCount,
            summary.CoveragePercent,
            settings);

        return new SkillGapRun
        {
            EmployeeId = employee.Id,
            RequirementSetId = set.Id,
            GeneratedAt = generatedAt,
            GeneratedBy = generatedBy,
            GapCount = summary.TotalGap,
            CalculationVersion = SkillGapCalculator.CalculationVersion,
            SummarySnapshot = JsonSerializer.Serialize(snapshot, SkillGapSnapshot.JsonOptions),
        };
    }

    private static SkillGapItem BuildItem(Guid runId, SkillGapLineResult line) => new()
    {
        SkillGapRunId = runId,
        CompetencyId = line.CompetencyId,
        RequiredLevel = line.RequiredLevel,
        CurrentLevel = line.CurrentLevel,
        GapSteps = line.GapSteps,
        WeightPercent = line.WeightPercent,
        Mandatory = line.Mandatory,
        MandatoryMultiplier = line.MandatoryMultiplier,
        PriorityScore = line.PriorityScore,
        Severity = line.Severity,
    };

    private async Task<Dictionary<Guid, PositionRequirementSet>> LoadActiveSetsAsync(
        IReadOnlyList<Employee> employees, PositionRequirementSet? requirementSetOverride)
    {
        if (requirementSetOverride != null)
        {
            return new Dictionary<Guid, PositionRequirementSet>();
        }

        var positionIds = employees
            .Where(e => e.JobPositionId.HasValue)
            .Select(e => e.JobPositionId!.Value)
            .Distinct()
            .ToList();

        var sets = await _context.PositionRequirementSets
            .AsNoTracking()
            .Where(s => positionIds.Contains(s.JobPositionId) && s.Status == Statuses.PositionRequirementSet.Active)
            .ToListAsync();

        return sets.ToDictionary(s => s.JobPositionId);
    }

    private async Task<Dictionary<Guid, List<SkillGapRequirementLine>>> LoadRequirementsAsync(List<Guid> setIds)
    {
        var items = await _context.PositionRequirementItems
            .AsNoTracking()
            .Where(i => setIds.Contains(i.RequirementSetId))
            .Select(i => new { i.RequirementSetId, Line = new SkillGapRequirementLine(i.CompetencyId, i.RequiredLevel, i.WeightPercent, i.IsMandatory) })
            .ToListAsync();

        return items
            .GroupBy(i => i.RequirementSetId)
            .ToDictionary(g => g.Key, g => g.Select(i => i.Line).ToList());
    }

    private async Task<Dictionary<Guid, Dictionary<Guid, short>>> LoadConfirmedLevelsAsync(List<Guid> employeeIds)
    {
        var profiles = await _context.EmployeeCompetencyProfiles
            .AsNoTracking()
            .Where(p => employeeIds.Contains(p.EmployeeId))
            .Select(p => new { p.EmployeeId, p.CompetencyId, p.ConfirmedLevel })
            .ToListAsync();

        return profiles
            .GroupBy(p => p.EmployeeId)
            .ToDictionary(g => g.Key, g => g.ToDictionary(p => p.CompetencyId, p => p.ConfirmedLevel));
    }
}
