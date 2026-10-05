using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.Dashboard;

/// <summary>
/// Dashboard năng lực (OW-01, LCA-01): KPI, 6 miền năng lực và nhân sự cần chú ý, tính trên snapshot skill gap
/// mới nhất của mỗi nhân viên đang làm việc trong phạm vi người gọi (EmployeeScope). Chỉ đọc.
/// </summary>
public class GetCapabilityDashboardUseCase : IUseCase<GetCapabilityDashboardUseCaseInput, GetCapabilityDashboardUseCaseOutput>
{
    private const int AtRiskLimit = 5;
    /// <summary>Số khóa gợi ý mỗi nhân viên được xét là "chờ duyệt" (giống màn hình duyệt gợi ý).</summary>
    private const int RecommendationsPerEmployee = 3;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunReader _runReader;
    private readonly RecommendationWeightsProvider _weightsProvider;
    private readonly EmployeeRecommendationService _recommendationService;

    public GetCapabilityDashboardUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        SkillGapRunReader runReader,
        RecommendationWeightsProvider weightsProvider,
        EmployeeRecommendationService recommendationService)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _runReader = runReader;
        _weightsProvider = weightsProvider;
        _recommendationService = recommendationService;
    }

    public async Task<GetCapabilityDashboardUseCaseOutput> ExecuteAsync(GetCapabilityDashboardUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var activeEmployees = _employeeScope.VisibleEmployees().Where(e => e.Status == Statuses.Employee.Active);

        // So theo Id (tie-break) thay vì "GeneratedAt == Max": 2 run trùng thời điểm không làm nhân đôi dòng
        var latestRuns = _context.SkillGapRuns.Where(r => r.Id == _context.SkillGapRuns
            .Where(x => x.EmployeeId == r.EmployeeId)
            .OrderByDescending(x => x.GeneratedAt)
            .ThenByDescending(x => x.Id)
            .Select(x => x.Id)
            .First());

        // Coverage và số khoảng trống HIGH nằm trong summary_snapshot (JSON) → đọc qua SkillGapRunReader
        var headers = await _runReader.Headers(activeEmployees, latestRuns).ToListAsync();
        var runs = headers.Select(h => _runReader.FillListItem(h, new SkillGapRunListItem())).ToList();
        var analyzedEmployeeIds = runs.Select(r => r.EmployeeId).ToList();
        var (overdue, completionRate) = await GetAssignmentStatsAsync(analyzedEmployeeIds);

        return new GetCapabilityDashboardUseCaseOutput
        {
            Kpis = new CapabilityKpis
            {
                Employees = runs.Count,
                AverageCoverage = runs.Count == 0 ? 0m : Math.Round(runs.Average(r => r.CoveragePercent), 2),
                EmployeesWithHigh = runs.Count(r => r.HighCount > 0),
                OverdueAssignments = overdue,
                CompletionRate = completionRate,
                PendingRecommendations = await CountPendingRecommendationsAsync(organizationId, analyzedEmployeeIds),
            },
            Domains = await GetDomainsAsync(organizationId, activeEmployees, latestRuns),
            AtRisk = runs
                .Where(r => r.HighCount > 0)
                .OrderByDescending(r => r.HighCount)
                .ThenBy(r => r.CoveragePercent)
                .ThenBy(r => r.EmployeeName)
                .Take(AtRiskLimit)
                .Select(r => new AtRiskEmployee
                {
                    EmployeeId = r.EmployeeId,
                    Name = r.EmployeeName,
                    DepartmentName = r.DepartmentName,
                    HighCount = r.HighCount,
                    CoveragePercent = r.CoveragePercent,
                })
                .ToList(),
        };
    }

    /// <summary>Mọi miền năng lực của tổ chức (miền chưa có dữ liệu trả 0) để radar luôn đủ trục.</summary>
    private async Task<List<CapabilityDomain>> GetDomainsAsync(Guid organizationId, IQueryable<Employee> activeEmployees, IQueryable<SkillGapRun> latestRuns)
    {
        var latestRunIds = from run in latestRuns
                           join employee in activeEmployees on run.EmployeeId equals employee.Id
                           select run.Id;

        var averages = await (
                from item in _context.SkillGapItems
                join competency in _context.Competencies on item.CompetencyId equals competency.Id
                where latestRunIds.Contains(item.SkillGapRunId)
                group item by competency.CategoryId into g
                select new
                {
                    CategoryId = g.Key,
                    Required = g.Average(i => (decimal)i.RequiredLevel),
                    // Chưa có hồ sơ năng lực = mức 0; vượt yêu cầu tính bằng mức yêu cầu
                    Current = g.Average(i => (decimal)((i.CurrentLevel ?? 0) > i.RequiredLevel ? i.RequiredLevel : (i.CurrentLevel ?? 0))),
                })
            .ToDictionaryAsync(a => a.CategoryId);

        var categories = await _context.CompetencyCategories
            .Where(c => c.OrganizationId == organizationId && c.Status == Statuses.MasterData.Active)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.SortOrder })
            .ToListAsync();

        return categories.Select(c => new CapabilityDomain
        {
            CategoryId = c.Id,
            Name = c.Name,
            SortOrder = c.SortOrder,
            AverageRequired = averages.TryGetValue(c.Id, out var a) ? Math.Round(a.Required, 2) : 0m,
            AverageCurrent = averages.TryGetValue(c.Id, out var b) ? Math.Round(b.Current, 2) : 0m,
        }).ToList();
    }

    private async Task<(int Overdue, decimal CompletionRate)> GetAssignmentStatsAsync(List<Guid> employeeIds)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var assignments = await _context.CourseAssignments
            .Where(a => employeeIds.Contains(a.EmployeeId) && a.Status == Statuses.CourseAssignment.Active)
            .Select(a => new
            {
                a.DueDate,
                Completed = _context.Enrollments.Any(e => e.CourseAssignmentId == a.Id && e.Status == Statuses.Enrollment.Completed),
            })
            .ToListAsync();

        var overdue = assignments.Count(a => !a.Completed && a.DueDate != null && a.DueDate < today);
        var completionRate = assignments.Count == 0 ? 0m : Math.Round(assignments.Count(a => a.Completed) * 100m / assignments.Count);
        return (overdue, completionRate);
    }

    /// <summary>
    /// Gợi ý chờ duyệt = top 3 khóa gợi ý của mỗi nhân viên, chưa ghi danh và chưa có quyết định ACCEPTED/DISMISSED
    /// (REOPENED = chờ duyệt lại). Chạy engine gợi ý cho từng nhân viên: chi phí tăng theo số nhân viên đã phân tích.
    /// </summary>
    private async Task<int> CountPendingRecommendationsAsync(Guid organizationId, List<Guid> employeeIds)
    {
        if (employeeIds.Count == 0)
        {
            return 0;
        }

        var weights = await _weightsProvider.GetAsync(organizationId);
        var decided = (await _context.RecommendationDecisions
                .Where(d => employeeIds.Contains(d.EmployeeId) && d.Status != Statuses.RecommendationDecision.Reopened)
                .Select(d => new { d.EmployeeId, d.CourseId })
                .ToListAsync())
            .Select(d => (d.EmployeeId, d.CourseId))
            .ToHashSet();

        var pending = 0;
        foreach (var employeeId in employeeIds)
        {
            var result = await _recommendationService.RecommendAsync(organizationId, employeeId, weights, RecommendationsPerEmployee);
            pending += result.Items.Count(item =>
                item.Course.EnrollmentStatus == null && !decided.Contains((employeeId, item.Course.CourseId)));
        }

        return pending;
    }
}
