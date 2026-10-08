using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;

/// <summary>Latest skill gap run of an employee with its parsed summary (null when the snapshot is missing or damaged).</summary>
public sealed record LatestSkillGapRun(Guid RunId, Guid EmployeeId, int GapCount, SkillGapSnapshot? Summary);

/// <summary>
/// Loads the latest skill gap run of each given employee (workforce list, competency matrix, gap analytics).
/// Callers pass employees already limited by EmployeeScope.
/// </summary>
public class LatestSkillGapRuns
{
    private readonly IApplicationDbContext _context;

    public LatestSkillGapRuns(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<Guid, LatestSkillGapRun>> LoadAsync(IReadOnlyCollection<Guid> employeeIds)
    {
        if (employeeIds.Count == 0)
        {
            return new Dictionary<Guid, LatestSkillGapRun>();
        }

        var runs = await _context.SkillGapRuns
            .AsNoTracking()
            .Where(run => employeeIds.Contains(run.EmployeeId)
                          && !_context.SkillGapRuns.Any(newer => newer.EmployeeId == run.EmployeeId && newer.GeneratedAt > run.GeneratedAt))
            .Select(run => new { run.Id, run.EmployeeId, run.GapCount, run.SummarySnapshot })
            .ToListAsync();

        // Two runs with the same timestamp are practically impossible; keep one deterministically.
        return runs
            .GroupBy(run => run.EmployeeId)
            .Select(group => group.OrderByDescending(run => run.Id).First())
            .ToDictionary(
                run => run.EmployeeId,
                run => new LatestSkillGapRun(run.Id, run.EmployeeId, run.GapCount, Parse(run.SummarySnapshot)));
    }

    private static SkillGapSnapshot? Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<SkillGapSnapshot>(json, SkillGapSnapshot.JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
