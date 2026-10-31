using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Reports;

// ── GET /intelligence/dashboard ──
public class GetDashboardUseCase : IUseCase<GetDashboardInput, DashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly LatestSkillGapRuns _latestRuns;

    public GetDashboardUseCase(IApplicationDbContext context, ICurrentUser currentUser, LatestSkillGapRuns latestRuns)
    {
        _context = context;
        _currentUser = currentUser;
        _latestRuns = latestRuns;
    }

    public async Task<DashboardDto> ExecuteAsync(GetDashboardInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var employeeCount = await _context.Employees.AsNoTracking()
            .CountAsync(e => e.OrganizationId == orgId && e.Status == "ACTIVE");

        var assignments = _context.CourseAssignments.AsNoTracking()
            .Where(ca => _context.Courses.AsNoTracking().Any(c => c.Id == ca.CourseId && c.OrganizationId == orgId));

        var totalAssignments = await assignments.CountAsync(ca => ca.Status == "ACTIVE");

        var enrollments = _context.Enrollments.AsNoTracking()
            .Where(e => assignments.Any(ca => ca.Id == e.CourseAssignmentId));
        var completedAssignments = await enrollments.CountAsync(e => e.Status == "COMPLETED");
        var overdueAssignments = await assignments.CountAsync(ca =>
            ca.DueDate != null && ca.DueDate < today && ca.Status == "ACTIVE"
            && !enrollments.Any(e => e.CourseAssignmentId == ca.Id && e.Status == "COMPLETED"));

        var completionRate = totalAssignments > 0
            ? Math.Round((decimal)completedAssignments / totalAssignments * 100, 1)
            : 0;

        // ── Skill gap snapshots for all active employees ──
        var orgEmployeeIds = await _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == orgId && e.Status == "ACTIVE")
            .Select(e => e.Id)
            .ToListAsync();

        var snapshots = await _latestRuns.LoadAsync(orgEmployeeIds);
        var coverages = snapshots.Values
            .Where(s => s.Summary != null)
            .Select(s => s.Summary!.CoveragePercent)
            .ToList();
        var averageCoverage = coverages.Count > 0
            ? Math.Round(coverages.Average(), 1)
            : 0m;

        var highGapEmployees = snapshots.Values
            .Count(s => s.Summary != null && s.Summary.HighCount > 0);

        // ── Domain-level averages from latest run items ──
        var latestRunIds = snapshots.Values.Select(s => s.RunId).ToList();
        var domainAverages = latestRunIds.Count > 0
            ? await (
                from item in _context.SkillGapItems.AsNoTracking()
                where latestRunIds.Contains(item.SkillGapRunId)
                join comp in _context.Competencies.AsNoTracking() on item.CompetencyId equals comp.Id
                group item by comp.CategoryId into g
                select new
                {
                    CategoryId = g.Key,
                    AverageRequired = g.Average(i => (decimal)i.RequiredLevel),
                    AverageCurrent = g.Average(i => (decimal)Math.Min(i.CurrentLevel ?? 0, i.RequiredLevel)),
                }
            ).ToListAsync()
            : new();

        var categories = await _context.CompetencyCategories.AsNoTracking()
            .Where(cc => cc.OrganizationId == orgId)
            .OrderBy(cc => cc.SortOrder)
            .Select(cc => new { cc.Id, cc.Name, cc.SortOrder })
            .ToListAsync();

        if (categories.Count == 0)
        {
            categories = await _context.CompetencyCategories.AsNoTracking()
                .OrderBy(cc => cc.SortOrder)
                .Take(6)
                .Select(cc => new { cc.Id, cc.Name, cc.SortOrder })
                .ToListAsync();
        }

        var domains = categories.Select(cc =>
        {
            var avg = domainAverages.FirstOrDefault(d => d.CategoryId == cc.Id);
            return new DomainStats
            {
                CategoryId = cc.Id.ToString(),
                Name = cc.Name,
                SortOrder = cc.SortOrder,
                AverageRequired = avg != null ? Math.Round(avg.AverageRequired, 2) : 0,
                AverageCurrent = avg != null ? Math.Round(avg.AverageCurrent, 2) : 0,
            };
        }).ToList();

        // ── At-risk employees (highest HIGH gap count) ──
        var atRiskSnapshots = snapshots.Values
            .Where(s => s.Summary != null && s.Summary.HighCount > 0)
            .OrderByDescending(s => s.Summary!.HighCount)
            .ThenBy(s => s.Summary!.CoveragePercent)
            .Take(10)
            .ToList();

        var atRiskEmployeeIds = atRiskSnapshots.Select(s => s.EmployeeId).ToList();
        var atRiskEmployees = atRiskEmployeeIds.Count > 0
            ? await (
                from emp in _context.Employees.AsNoTracking()
                where atRiskEmployeeIds.Contains(emp.Id)
                join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
                from dept in deptJoin.DefaultIfEmpty()
                select new { emp.Id, emp.FullName, DeptName = dept != null ? dept.Name : (string?)null }
            ).ToListAsync()
            : new();
        var empLookup = atRiskEmployees.ToDictionary(e => e.Id);

        var atRisk = atRiskSnapshots
            .Where(s => empLookup.ContainsKey(s.EmployeeId))
            .Select(s =>
            {
                var emp = empLookup[s.EmployeeId];
                return new AtRiskEmployee
                {
                    EmployeeId = s.EmployeeId.ToString(),
                    Name = emp.FullName,
                    DepartmentName = emp.DeptName,
                    HighCount = s.Summary!.HighCount,
                    CoveragePercent = Math.Round(s.Summary.CoveragePercent, 1),
                };
            })
            .ToList();

        // ── Pending recommendations ──
        var pendingRecommendations = await _context.RecommendationReviews.AsNoTracking()
            .CountAsync(r => r.OrganizationId == orgId && r.Status == "PENDING");

        return new DashboardDto
        {
            Kpis = new DashboardKpis
            {
                Employees = employeeCount,
                AverageCoverage = averageCoverage,
                EmployeesWithHigh = highGapEmployees,
                OverdueAssignments = overdueAssignments,
                CompletionRate = completionRate,
                PendingRecommendations = pendingRecommendations,
            },
            Domains = domains,
            AtRisk = atRisk,
        };
    }
}

// ── GET /intelligence/reports/overview ──
public class GetReportsOverviewUseCase : IUseCase<GetReportsOverviewInput, ReportsOverviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetReportsOverviewUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ReportsOverviewDto> ExecuteAsync(GetReportsOverviewInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        // ── Workforce ──
        var empQuery = _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == orgId);

        if (input.DepartmentId.HasValue)
            empQuery = empQuery.Where(e => e.DepartmentId == input.DepartmentId.Value);
        if (input.JobPositionId.HasValue)
            empQuery = empQuery.Where(e => e.JobPositionId == input.JobPositionId.Value);

        var totalEmployees = await empQuery.CountAsync();
        var activeEmployees = await empQuery.CountAsync(e => e.Status == "ACTIVE");

        var departmentsCount = await _context.Departments.AsNoTracking()
            .CountAsync(d => d.OrganizationId == orgId);
        var positionsCount = await _context.JobPositions.AsNoTracking()
            .CountAsync(j => j.OrganizationId == orgId);

        var byDepartment = await (
            from dept in _context.Departments.AsNoTracking()
            where dept.OrganizationId == orgId
            select new DepartmentSummary
            {
                Id = dept.Id.ToString(),
                Code = dept.Code,
                Name = dept.Name,
                EmployeeCount = _context.Employees.AsNoTracking().Count(e => e.DepartmentId == dept.Id && e.Status == "ACTIVE"),
                AverageCoverage = 0,
            }
        ).ToListAsync();

        // ── Training ──
        var caQuery = _context.CourseAssignments.AsNoTracking()
            .Where(ca => _context.Courses.AsNoTracking().Any(c => c.Id == ca.CourseId && c.OrganizationId == orgId));

        if (input.DepartmentId.HasValue)
            caQuery = caQuery.Where(ca => _context.Employees.Any(e => e.Id == ca.EmployeeId && e.DepartmentId == input.DepartmentId.Value));

        var activeCaQuery = caQuery.Where(ca => ca.Status == "ACTIVE");
        var totalAssignments = await activeCaQuery.CountAsync();

        var caEnrollments = _context.Enrollments.AsNoTracking()
            .Where(e => activeCaQuery.Any(ca => ca.Id == e.CourseAssignmentId));
        var completedAssignments = await caEnrollments.CountAsync(e => e.Status == "COMPLETED");
        var inProgressAssignments = await caEnrollments.CountAsync(e => e.Status == "IN_PROGRESS");
        var trainingCompletionRate = totalAssignments > 0
            ? Math.Round((decimal)completedAssignments / totalAssignments * 100, 1)
            : 0;

        var courses = await _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == orgId && c.Status == "PUBLISHED")
            .Select(c => new CourseTrainingSummary
            {
                Id = c.Id.ToString(),
                Code = c.Code,
                Title = c.Title,
                DomainName = null,
                LearnerCount = _context.Enrollments.AsNoTracking().Count(e => e.CourseId == c.Id),
                AverageProgress = _context.Enrollments.AsNoTracking().Any(e => e.CourseId == c.Id)
                    ? _context.Enrollments.AsNoTracking().Where(e => e.CourseId == c.Id).Average(e => e.ProgressPercent)
                    : 0,
            })
            .ToListAsync();

        // ── Assessment ──
        var attempts = _context.AssessmentAttempts.AsNoTracking()
            .Where(a => _context.Assessments.Any(asmt => asmt.Id == a.AssessmentId &&
                _context.Courses.Any(c => c.Id == asmt.CourseId && c.OrganizationId == orgId)));

        var totalAttempts = await attempts.CountAsync();
        var passedAttempts = await attempts.CountAsync(a => a.Passed == true);
        var passRate = totalAttempts > 0 ? Math.Round((decimal)passedAttempts / totalAttempts * 100, 1) : 0;
        var scoredAttempts = attempts.Where(a => a.Score.HasValue);
        var hasScored = await scoredAttempts.AnyAsync();
        var averageScore = hasScored
            ? Math.Round(await scoredAttempts.AverageAsync(a => (decimal)a.Score!.Value), 1)
            : 0;

        var excellentCount = await attempts.CountAsync(a => a.Score >= 90);
        var standardCount = await attempts.CountAsync(a => a.Score >= 60 && a.Score < 90);
        var failedCount = await attempts.CountAsync(a => a.Score < 60);

        // ── Evidence ──
        var taskTemplates = _context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => t.OrganizationId == orgId);
        var totalTasks = await taskTemplates.CountAsync();

        var submissions = _context.TaskSubmissions.AsNoTracking()
            .Where(s => _context.TaskAssignments.Any(ta => ta.Id == s.TaskAssignmentId &&
                _context.PracticalTaskTemplates.Any(t => t.Id == ta.TaskTemplateId && t.OrganizationId == orgId)));
        var currentSubmissions = submissions.Where(s => s.Status != "SUPERSEDED");
        var totalSubmissions = await currentSubmissions.CountAsync();
        var approvedSubmissions = await _context.TaskEvaluations.AsNoTracking()
            .CountAsync(ev => ev.Verdict == "PASSED"
                && currentSubmissions.Any(s => s.Id == ev.TaskSubmissionId));
        var approvalRate = totalSubmissions > 0
            ? Math.Round((decimal)approvedSubmissions / totalSubmissions * 100, 1)
            : 0;

        // Hai bước (không lồng IQueryable trong phép chiếu) để EF dịch được sang SQL.
        var orgDepartments = await _context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == orgId)
            .Select(d => new { d.Id, d.Name })
            .ToListAsync();
        var orgAssignments = await (
            from ta in _context.TaskAssignments.AsNoTracking()
            join e in _context.Employees.AsNoTracking() on ta.EmployeeId equals e.Id
            where e.OrganizationId == orgId
                && _context.PracticalTaskTemplates.Any(t => t.Id == ta.TaskTemplateId && t.OrganizationId == orgId)
            select new { ta.Id, e.DepartmentId }
        ).ToListAsync();
        var orgSubmissions = await _context.TaskSubmissions.AsNoTracking()
            .Where(s => s.Status != "SUPERSEDED"
                && _context.TaskAssignments.Any(ta => ta.Id == s.TaskAssignmentId
                    && _context.PracticalTaskTemplates.Any(t => t.Id == ta.TaskTemplateId && t.OrganizationId == orgId)))
            .Select(s => new { s.Id, s.TaskAssignmentId })
            .ToListAsync();
        var passedSubmissionIds = (await _context.TaskEvaluations.AsNoTracking()
            .Where(ev => ev.Verdict == "PASSED")
            .Select(ev => ev.TaskSubmissionId)
            .ToListAsync()).ToHashSet();
        var assignmentDept = orgAssignments.ToDictionary(a => a.Id, a => a.DepartmentId);

        var evidenceByDept = orgDepartments.Select(dept =>
        {
            var assigned = orgAssignments.Count(a => a.DepartmentId == dept.Id);
            var subs = orgSubmissions
                .Where(s => assignmentDept.TryGetValue(s.TaskAssignmentId, out var d) && d == dept.Id)
                .ToList();
            var approved = subs.Count(s => passedSubmissionIds.Contains(s.Id));
            return new DepartmentEvidenceSummary
            {
                DepartmentId = dept.Id.ToString(),
                DepartmentName = dept.Name,
                AssignedCount = assigned,
                SubmittedCount = subs.Count,
                ApprovedCount = approved,
                ApprovalRate = subs.Count > 0 ? Math.Round((decimal)approved / subs.Count * 100, 1) : 0,
            };
        }).ToList();

        return new ReportsOverviewDto
        {
            Workforce = new WorkforceReport
            {
                TotalEmployees = totalEmployees,
                ActiveEmployees = activeEmployees,
                DepartmentsCount = departmentsCount,
                PositionsCount = positionsCount,
                G1Count = 0,
                G2Count = 0,
                G3Count = 0,
                ByDepartment = byDepartment,
            },
            Training = new TrainingReport
            {
                TotalAssignments = totalAssignments,
                CompletedAssignments = completedAssignments,
                InProgressAssignments = inProgressAssignments,
                CompletionRate = trainingCompletionRate,
                Courses = courses,
            },
            Assessment = new AssessmentReport
            {
                TotalAttempts = totalAttempts,
                PassRate = passRate,
                AverageScore = averageScore,
                RetakeCount = 0,
                ExcellentCount = excellentCount,
                ExcellentPercent = totalAttempts > 0 ? Math.Round((decimal)excellentCount / totalAttempts * 100, 1) : 0,
                StandardCount = standardCount,
                StandardPercent = totalAttempts > 0 ? Math.Round((decimal)standardCount / totalAttempts * 100, 1) : 0,
                FailedCount = failedCount,
                FailedPercent = totalAttempts > 0 ? Math.Round((decimal)failedCount / totalAttempts * 100, 1) : 0,
                AverageDurationMinutes = 0,
                FirstTimePassRate = 0,
            },
            Evidence = new EvidenceReport
            {
                TotalTasks = totalTasks,
                TotalSubmissions = totalSubmissions,
                ApprovedCount = approvedSubmissions,
                ApprovalRate = approvalRate,
                ByDepartment = evidenceByDept,
            },
        };
    }
}
