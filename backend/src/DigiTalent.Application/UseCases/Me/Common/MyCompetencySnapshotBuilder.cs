using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>1 năng lực theo chuẩn vị trí, đã ghép mức xác nhận hiện tại và kết quả tính gap.</summary>
public sealed record MyCompetencyLine(
    Guid CompetencyId,
    string CompetencyCode,
    string CompetencyName,
    string? CategoryName,
    short RequiredLevel,
    short? CurrentLevel,
    DateTimeOffset? ConfirmedAt,
    short GapSteps,
    decimal WeightPercent,
    bool Mandatory,
    bool RequiresPracticalEvidence,
    string? Note,
    decimal PriorityScore,
    string? Severity);

/// <summary>Năng lực đã xác nhận (employee_competency_profiles) — kể cả năng lực vị trí không yêu cầu.</summary>
public sealed record MyConfirmedCompetency(Guid CompetencyId, string Code, string Name, string? CategoryName, short Level, DateTimeOffset ConfirmedAt);

public sealed record MyCompetencySnapshot(
    Employee Employee,
    JobPosition? Position,
    PositionRequirementSet? RequirementSet,
    IReadOnlyList<MyCompetencyLine> Lines,
    SkillGapSummary? Summary,
    string? SkipReason,
    IReadOnlyList<MyConfirmedCompetency> Confirmed);

/// <summary>
/// Tính skill gap TRỰC TIẾP (không lưu snapshot) cho chính nhân viên: bộ tiêu chuẩn ACTIVE của vị trí hiện tại
/// so với hồ sơ năng lực đã xác nhận. Cùng công thức SkillGapCalculator với snapshot của HR/Manager,
/// nên số liệu khớp nhau; khác ở chỗ luôn phản ánh dữ liệu mới nhất.
/// </summary>
public class MyCompetencySnapshotBuilder
{
    private readonly IApplicationDbContext _context;
    private readonly SkillGapSettingsProvider _settingsProvider;

    public MyCompetencySnapshotBuilder(IApplicationDbContext context, SkillGapSettingsProvider settingsProvider)
    {
        _context = context;
        _settingsProvider = settingsProvider;
    }

    public async Task<MyCompetencySnapshot> BuildAsync(Employee employee)
    {
        var confirmed = await (
                from profile in _context.EmployeeCompetencyProfiles.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on profile.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id into categories
                from category in categories.DefaultIfEmpty()
                where profile.EmployeeId == employee.Id
                orderby competency.Code
                select new MyConfirmedCompetency(
                    profile.CompetencyId,
                    competency.Code,
                    competency.Name,
                    category != null ? category.Name : null,
                    profile.ConfirmedLevel,
                    profile.ConfirmedAt))
            .ToListAsync();

        if (employee.Status != Statuses.Employee.Active)
        {
            return Skipped(employee, null, SkillGapSkipReasons.EmployeeNotActive, confirmed);
        }

        if (employee.JobPositionId == null)
        {
            return Skipped(employee, null, SkillGapSkipReasons.NoJobPosition, confirmed);
        }

        var position = await _context.JobPositions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == employee.JobPositionId.Value);

        var set = await _context.PositionRequirementSets
            .AsNoTracking()
            .Where(s => s.JobPositionId == employee.JobPositionId.Value && s.Status == Statuses.PositionRequirementSet.Active)
            .OrderByDescending(s => s.VersionNo)
            .FirstOrDefaultAsync();
        if (set == null)
        {
            return Skipped(employee, position, SkillGapSkipReasons.NoActiveRequirementSet, confirmed);
        }

        var requirements = await (
                from item in _context.PositionRequirementItems.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id into categories
                from category in categories.DefaultIfEmpty()
                where item.RequirementSetId == set.Id
                select new
                {
                    item.CompetencyId,
                    competency.Code,
                    competency.Name,
                    CategoryName = category != null ? category.Name : null,
                    item.RequiredLevel,
                    item.WeightPercent,
                    item.IsMandatory,
                    item.RequiresPracticalEvidence,
                    item.Note,
                })
            .ToListAsync();

        var settings = await _settingsProvider.GetAsync(employee.OrganizationId);
        var confirmedLevels = confirmed.ToDictionary(c => c.CompetencyId, c => c.Level);
        var result = SkillGapCalculator.Calculate(
            requirements.Select(r => new SkillGapRequirementLine(r.CompetencyId, r.RequiredLevel, r.WeightPercent, r.IsMandatory)).ToList(),
            confirmedLevels,
            settings);

        var confirmedAt = confirmed.ToDictionary(c => c.CompetencyId, c => c.ConfirmedAt);
        var lines = result.Items
            .Join(requirements, line => line.CompetencyId, r => r.CompetencyId, (line, r) => new MyCompetencyLine(
                line.CompetencyId,
                r.Code,
                r.Name,
                r.CategoryName,
                line.RequiredLevel,
                line.CurrentLevel,
                confirmedAt.TryGetValue(line.CompetencyId, out var at) ? at : null,
                line.GapSteps,
                line.WeightPercent,
                line.Mandatory,
                r.RequiresPracticalEvidence,
                r.Note,
                line.PriorityScore,
                line.Severity))
            .OrderByDescending(l => l.PriorityScore)
            .ThenBy(l => l.CompetencyCode, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new MyCompetencySnapshot(employee, position, set, lines, result.Summary, null, confirmed);
    }

    private static MyCompetencySnapshot Skipped(
        Employee employee, JobPosition? position, string reason, IReadOnlyList<MyConfirmedCompetency> confirmed) =>
        new(employee, position, null, Array.Empty<MyCompetencyLine>(), null, reason, confirmed);
}
