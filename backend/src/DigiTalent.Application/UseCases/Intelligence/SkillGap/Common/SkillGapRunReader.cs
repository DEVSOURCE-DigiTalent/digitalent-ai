using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;

/// <summary>
/// Đọc snapshot skill gap đã lưu thành DTO (kèm tên nhân viên, phòng ban, vị trí, năng lực).
/// Luôn lọc qua tập nhân viên mà người gọi được phép xem (EmployeeScope).
/// </summary>
public class SkillGapRunReader
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SkillGapRunReader> _logger;

    public SkillGapRunReader(IApplicationDbContext context, ILogger<SkillGapRunReader> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>Header của các run (chưa có Items). <paramref name="runs"/> mặc định là mọi run.</summary>
    public IQueryable<SkillGapRunHeader> Headers(IQueryable<Employee> visibleEmployees, IQueryable<SkillGapRun>? runs = null) =>
        from run in runs ?? _context.SkillGapRuns
        join employee in visibleEmployees on run.EmployeeId equals employee.Id
        join set in _context.PositionRequirementSets on run.RequirementSetId equals set.Id
        join department in _context.Departments on employee.DepartmentId equals department.Id
        join position in _context.JobPositions on set.JobPositionId equals position.Id
        select new SkillGapRunHeader
        {
            RunId = run.Id,
            EmployeeId = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            EmployeeName = employee.FullName,
            DepartmentId = employee.DepartmentId,
            DepartmentName = department.Name,
            JobPositionId = set.JobPositionId,
            JobPositionName = position.Name,
            RequirementSetId = set.Id,
            RequirementSetVersionNo = set.VersionNo,
            GeneratedAt = run.GeneratedAt,
            GeneratedBy = run.GeneratedBy,
            GapCount = run.GapCount,
            CalculationVersion = run.CalculationVersion,
            SummarySnapshot = run.SummarySnapshot,
        };

    public async Task<SkillGapRunDetail?> FindDetailAsync(IQueryable<Employee> visibleEmployees, Guid runId)
    {
        var header = await Headers(visibleEmployees).FirstOrDefaultAsync(h => h.RunId == runId);
        return header == null ? null : await ToDetailAsync(header);
    }

    public async Task<SkillGapRunDetail?> FindLatestDetailAsync(IQueryable<Employee> visibleEmployees, Guid employeeId)
    {
        var header = await Headers(visibleEmployees)
            .Where(h => h.EmployeeId == employeeId)
            .OrderByDescending(h => h.GeneratedAt)
            .ThenByDescending(h => h.RunId)
            .FirstOrDefaultAsync();
        return header == null ? null : await ToDetailAsync(header);
    }

    public T FillListItem<T>(SkillGapRunHeader header, T target) where T : SkillGapRunListItem
    {
        var snapshot = ParseSnapshot(header);
        target.RunId = header.RunId;
        target.EmployeeId = header.EmployeeId;
        target.EmployeeCode = header.EmployeeCode;
        target.EmployeeName = header.EmployeeName;
        target.DepartmentName = header.DepartmentName;
        target.JobPositionName = header.JobPositionName;
        target.RequirementSetVersionNo = header.RequirementSetVersionNo;
        target.GeneratedAt = header.GeneratedAt;
        target.GeneratedBy = header.GeneratedBy;
        target.GapCount = header.GapCount;
        target.HighCount = snapshot?.HighCount ?? 0;
        target.CoveragePercent = snapshot?.CoveragePercent ?? 0m;
        return target;
    }

    private async Task<SkillGapRunDetail> ToDetailAsync(SkillGapRunHeader header)
    {
        var items = await (
                from item in _context.SkillGapItems
                join competency in _context.Competencies on item.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories on competency.CategoryId equals category.Id
                where item.SkillGapRunId == header.RunId
                select new SkillGapItemDto
                {
                    CompetencyId = competency.Id,
                    CompetencyCode = competency.Code,
                    CompetencyName = competency.Name,
                    CategoryName = category.Name,
                    RequiredLevel = item.RequiredLevel,
                    CurrentLevel = item.CurrentLevel,
                    GapSteps = item.GapSteps,
                    WeightPercent = item.WeightPercent,
                    Mandatory = item.Mandatory,
                    MandatoryMultiplier = item.MandatoryMultiplier,
                    PriorityScore = item.PriorityScore,
                    Severity = item.Severity,
                })
            .ToListAsync();

        var detail = FillListItem(header, new SkillGapRunDetail());
        detail.RequirementSetId = header.RequirementSetId;
        detail.CalculationVersion = header.CalculationVersion;
        detail.Summary = ToSummary(ParseSnapshot(header), items);
        detail.Items = items
            .OrderByDescending(i => i.PriorityScore)
            .ThenBy(i => i.CompetencyName)
            .ToList();
        return detail;
    }

    private static SkillGapSummaryDto ToSummary(SkillGapSnapshot? snapshot, List<SkillGapItemDto> items)
    {
        if (snapshot == null)
        {
            // Snapshot hỏng/thiếu: dựng lại số đếm từ items (không có coverage & config)
            return new SkillGapSummaryDto
            {
                TotalRequired = items.Count,
                TotalMet = items.Count(i => i.GapSteps == 0),
                TotalGap = items.Count(i => i.GapSteps > 0),
            };
        }

        return new SkillGapSummaryDto
        {
            TotalRequired = snapshot.TotalRequired,
            TotalMet = snapshot.TotalMet,
            TotalGap = snapshot.TotalGap,
            HighCount = snapshot.HighCount,
            MediumCount = snapshot.MediumCount,
            LowCount = snapshot.LowCount,
            CoveragePercent = snapshot.CoveragePercent,
            Config = new SkillGapConfigDto
            {
                MandatoryMultiplier = snapshot.Config.MandatoryMultiplier,
                MediumWeightThreshold = snapshot.Config.MediumWeightThreshold,
            },
        };
    }

    private SkillGapSnapshot? ParseSnapshot(SkillGapRunHeader header)
    {
        if (string.IsNullOrWhiteSpace(header.SummarySnapshot))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<SkillGapSnapshot>(header.SummarySnapshot, SkillGapSnapshot.JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid summary_snapshot for skill gap run {RunId}", header.RunId);
            return null;
        }
    }
}

/// <summary>Dữ liệu thô của 1 run trước khi parse summary_snapshot.</summary>
public class SkillGapRunHeader
{
    public Guid RunId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
    public Guid RequirementSetId { get; set; }
    public int RequirementSetVersionNo { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public int GapCount { get; set; }
    public string CalculationVersion { get; set; } = string.Empty;
    public string? SummarySnapshot { get; set; }
}
