using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>Lĩnh vực TT02 và cấp của một khóa.</summary>
public sealed record BehaviorCourseDomain(int Number, string Name, int Tier);

/// <summary>Một báo cáo kèm người làm bài, khóa và lần nộp — đọc trong phạm vi nhân viên của người gọi.</summary>
public sealed class BehaviorReportRow
{
    public ProctoringBehaviorReport Report { get; init; } = null!;
    public string EmployeeName { get; init; } = string.Empty;
    public string? DepartmentName { get; init; }
    public string? PositionName { get; init; }
    public string? CourseCode { get; init; }
    public string? CourseTitle { get; init; }
    public int AttemptNo { get; init; }
    public DateTimeOffset SubmittedAt { get; init; }
    public string? Decision { get; init; }
}

/// <summary>
/// Đọc báo cáo hành vi của doanh nghiệp người gọi, chỉ của nhân viên trong <see cref="EmployeeScope"/> (chủ doanh nghiệp:
/// cả doanh nghiệp). Ngoài phạm vi → không thấy (404).
/// </summary>
public class BehaviorReportReader
{
    private static readonly string[] DomainCodes = ["TT02_D1", "TT02_D2", "TT02_D3", "TT02_D4", "TT02_D5", "TT02_D6"];

    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _scope;
    private readonly ICurrentUser _currentUser;
    private readonly PulseCatalogReader _catalog;

    public BehaviorReportReader(IApplicationDbContext context, EmployeeScope scope, ICurrentUser currentUser, PulseCatalogReader catalog)
    {
        _context = context;
        _scope = scope;
        _currentUser = currentUser;
        _catalog = catalog;
    }

    /// <summary>
    /// Lĩnh vực và cấp theo mã khóa (mọi bí danh A/M của mã), như khoảng trống năng lực đếm mức đạt được qua khóa học.
    /// </summary>
    public async Task<Dictionary<string, BehaviorCourseDomain>> CourseDomainsAsync()
    {
        var organizationId = OrganizationId;
        var categories = (await _context.CompetencyCategories.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && DomainCodes.Contains(c.Code))
                .Select(c => new { c.Id, c.Code, c.Name })
                .ToListAsync())
            .ToDictionary(c => c.Id, c => (Number: int.Parse(c.Code[^1..]), Name: PulseLearnerReader.DisplayName(c.Name)));
        var domains = new Dictionary<string, BehaviorCourseDomain>(StringComparer.OrdinalIgnoreCase);
        foreach (var course in await _catalog.LoadAsync(organizationId))
        {
            if (!categories.TryGetValue(course.CategoryId, out var category)) continue;
            foreach (var code in CourseCodes.Aliases(course.Code))
            {
                domains.TryAdd(code, new BehaviorCourseDomain(category.Number, category.Name, course.Tier));
            }
        }

        return domains;
    }

    public Guid OrganizationId => _currentUser.GetRequiredOrganizationId();

    public IQueryable<BehaviorReportRow> Query()
    {
        var organizationId = OrganizationId;
        return
            from report in _context.ProctoringBehaviorReports.AsNoTracking()
            join employee in _scope.VisibleEmployees().AsNoTracking() on report.EmployeeId equals employee.Id
            join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
            join submission in _context.CourseFinalSubmissions.AsNoTracking() on report.FinalSubmissionId equals (Guid?)submission.Id
            join course in _context.Courses.AsNoTracking() on report.CourseId equals (Guid?)course.Id
            where report.OrganizationId == organizationId
            select new BehaviorReportRow
            {
                Report = report,
                EmployeeName = employee.FullName,
                DepartmentName = department.Name,
                PositionName = _context.JobPositions.Where(p => p.Id == employee.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                CourseCode = course.Code,
                CourseTitle = course.Title,
                AttemptNo = submission.AttemptNo,
                SubmittedAt = submission.SubmittedAt,
                Decision = submission.Decision,
            };
    }

    public static T Fill<T>(T item, BehaviorReportRow row, BehaviorReportDetails details, IReadOnlyDictionary<string, BehaviorCourseDomain> domains)
        where T : BehaviorReportItemDto
    {
        var report = row.Report;
        var domain = row.CourseCode == null ? null : domains.GetValueOrDefault(row.CourseCode);
        item.DomainNumber = domain?.Number;
        item.DomainName = domain?.Name;
        item.Tier = domain?.Tier;
        item.ReportId = report.Id;
        item.SessionId = report.SessionId;
        item.EmployeeId = report.EmployeeId;
        item.EmployeeName = row.EmployeeName;
        item.DepartmentName = row.DepartmentName;
        item.PositionName = row.PositionName;
        item.CourseId = report.CourseId;
        item.CourseCode = row.CourseCode;
        item.CourseTitle = row.CourseTitle;
        item.AttemptNo = row.AttemptNo;
        item.SubmittedAt = row.SubmittedAt;
        item.DurationMs = details.DurationMs;
        item.Status = report.Status;
        item.RiskScore = report.RiskScore;
        item.RiskLevel = report.RiskLevel;
        item.AiLevel = report.AiLevel;
        item.Level = report.AiLevel ?? report.RiskLevel;
        item.Summary = report.Summary;
        item.FindingCount = details.Findings.Count;
        item.FindingTitles = details.Findings
            .OrderByDescending(f => Array.IndexOf(Domain.Constants.Statuses.RiskLevel.All, f.Severity))
            .ThenBy(f => f.StartMs)
            .Select(f => f.Title)
            .Take(3)
            .ToList();
        item.Decision = row.Decision;
        item.Marks = BehaviorReportComposer.Marks(details);
        return item;
    }
}
