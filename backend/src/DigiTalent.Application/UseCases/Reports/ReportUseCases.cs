using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Reports;

// ── GET /intelligence/dashboard ──
public class GetDashboardUseCase : IUseCase<GetDashboardInput, DashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetDashboardUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<DashboardDto> ExecuteAsync(GetDashboardInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var employeeCount = await _context.Employees.AsNoTracking()
            .CountAsync(e => e.OrganizationId == orgId && e.Status == "ACTIVE");

        var assignments = _context.CourseAssignments.AsNoTracking()
            .Where(ca => _context.Courses.AsNoTracking().Any(c => c.Id == ca.CourseId && c.OrganizationId == orgId));

        var totalAssignments = await assignments.CountAsync();
        var completedAssignments = await assignments.CountAsync(ca => ca.Status == "COMPLETED");
        var overdueAssignments = await assignments.CountAsync(ca =>
            ca.DueDate != null && ca.DueDate < today && ca.Status != "COMPLETED" && ca.Status != "CANCELLED");

        var completionRate = totalAssignments > 0
            ? Math.Round((decimal)completedAssignments / totalAssignments * 100, 1)
            : 0;

        var orgEmployeeIds = _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == orgId)
            .Select(e => e.Id);

        var highGapEmployees = await (
            from item in _context.SkillGapItems.AsNoTracking()
            join run in _context.SkillGapRuns.AsNoTracking() on item.SkillGapRunId equals run.Id
            where orgEmployeeIds.Contains(run.EmployeeId) && item.Severity == "HIGH"
            select run.EmployeeId
        ).Distinct().CountAsync();

        var categories = await _context.CompetencyCategories.AsNoTracking()
            .Select(cc => new DomainStats
            {
                CategoryId = cc.Id.ToString(),
                Name = cc.Name,
                SortOrder = cc.SortOrder,
                AverageRequired = 0,
                AverageCurrent = 0,
            })
            .OrderBy(d => d.SortOrder)
            .ToListAsync();

        var atRisk = await (
            from item in _context.SkillGapItems.AsNoTracking()
            join run in _context.SkillGapRuns.AsNoTracking() on item.SkillGapRunId equals run.Id
            join emp in _context.Employees.AsNoTracking() on run.EmployeeId equals emp.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            where emp.OrganizationId == orgId && item.Severity == "HIGH"
            group new { item, dept } by new { run.EmployeeId, emp.FullName, DeptName = dept != null ? dept.Name : null } into g
            orderby g.Count() descending
            select new AtRiskEmployee
            {
                EmployeeId = g.Key.EmployeeId.ToString(),
                Name = g.Key.FullName,
                DepartmentName = g.Key.DeptName,
                HighCount = g.Count(),
                CoveragePercent = 0,
            }
        ).Take(10).ToListAsync();

        return new DashboardDto
        {
            Kpis = new DashboardKpis
            {
                Employees = employeeCount,
                AverageCoverage = 0,
                EmployeesWithHigh = highGapEmployees,
                OverdueAssignments = overdueAssignments,
                CompletionRate = completionRate,
                PendingRecommendations = 0,
            },
            Domains = categories,
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

        var totalAssignments = await caQuery.CountAsync();
        var completedAssignments = await caQuery.CountAsync(ca => ca.Status == "COMPLETED");
        var inProgressAssignments = await caQuery.CountAsync(ca => ca.Status == "ACTIVE");
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
        var averageScore = totalAttempts > 0
            ? Math.Round(await attempts.Where(a => a.Score.HasValue).AverageAsync(a => (decimal)a.Score!.Value), 1)
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
        var currentSubmissions = submissions.Where(s => s.SupersedesSubmissionId == null);
        var totalSubmissions = await currentSubmissions.CountAsync();
        var approvedSubmissions = await currentSubmissions.CountAsync(s => s.Status == "APPROVED");
        var approvalRate = totalSubmissions > 0
            ? Math.Round((decimal)approvedSubmissions / totalSubmissions * 100, 1)
            : 0;

        var evidenceByDept = await (
            from dept in _context.Departments.AsNoTracking()
            where dept.OrganizationId == orgId
            let deptEmpIds = _context.Employees.AsNoTracking().Where(e => e.DepartmentId == dept.Id).Select(e => e.Id)
            let deptAssignments = _context.TaskAssignments.AsNoTracking()
                .Where(ta => deptEmpIds.Contains(ta.EmployeeId) &&
                    _context.PracticalTaskTemplates.Any(t => t.Id == ta.TaskTemplateId && t.OrganizationId == orgId))
            let deptSubs = _context.TaskSubmissions.AsNoTracking()
                .Where(s => s.SupersedesSubmissionId == null && deptAssignments.Any(ta => ta.Id == s.TaskAssignmentId))
            select new DepartmentEvidenceSummary
            {
                DepartmentId = dept.Id.ToString(),
                DepartmentName = dept.Name,
                AssignedCount = deptAssignments.Count(),
                SubmittedCount = deptSubs.Count(),
                ApprovedCount = deptSubs.Count(s => s.Status == "APPROVED"),
                ApprovalRate = deptSubs.Any()
                    ? Math.Round((decimal)deptSubs.Count(s => s.Status == "APPROVED") / deptSubs.Count() * 100, 1)
                    : 0,
            }
        ).ToListAsync();

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
