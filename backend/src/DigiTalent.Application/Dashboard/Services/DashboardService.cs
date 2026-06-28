using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Dashboard.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Dashboard.Services;

public class DashboardService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DashboardService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    /// <summary>
    /// HR/company-level dashboard — aggregate counts across the entire organization.
    /// </summary>
    public async Task<HrDashboardResponse> GetHrDashboardAsync()
    {
        var totalEmployees = await _context.Employees.CountAsync(e => e.EmploymentStatus == "ACTIVE");

        var activeEnrollments = await _context.Enrollments
            .CountAsync(e => e.Status == "IN_PROGRESS" || e.Status == "ACTIVE");

        var completedCourses = await _context.Enrollments
            .CountAsync(e => e.Status == "COMPLETED");

        var validCertificates = await _context.Certificates
            .CountAsync(c => c.Status == "VALID" && (!c.ExpiresAt.HasValue || c.ExpiresAt > DateTimeOffset.UtcNow));

        // Count distinct employees with high/critical training risk
        var highRiskEmployees = await _context.TrainingRiskScores
            .Where(r => r.RiskLevel == "HIGH" || r.RiskLevel == "CRITICAL")
            .Select(r => r.EmployeeId)
            .Distinct()
            .CountAsync();

        // Count distinct employees marked as ready
        var readyEmployees = await _context.ReadinessScores
            .Where(r => r.ReadinessLevel == "READY")
            .Select(r => r.EmployeeId)
            .Distinct()
            .CountAsync();

        return new HrDashboardResponse
        {
            TotalEmployees = totalEmployees,
            ActiveEnrollments = activeEnrollments,
            CompletedCourses = completedCourses,
            ValidCertificates = validCertificates,
            HighRiskEmployees = highRiskEmployees,
            ReadyEmployees = readyEmployees,
        };
    }

    /// <summary>
    /// Department-level dashboard — aggregates for departments the current user manages.
    /// </summary>
    public async Task<List<DepartmentDashboardResponse>> GetDepartmentDashboardAsync()
    {
        var managedDeptIds = _currentUser.ManagedDepartmentIds;

        // If user manages no specific departments, fall back to all (HR/Admin view)
        var deptsQuery = _context.Departments.AsQueryable();
        if (managedDeptIds.Count != 0)
            deptsQuery = deptsQuery.Where(d => managedDeptIds.Contains(d.Id));

        var departments = await deptsQuery.ToListAsync();

        var results = new List<DepartmentDashboardResponse>();
        foreach (var dept in departments)
        {
            var employeeIds = await _context.Employees
                .Where(e => e.DepartmentId == dept.Id && e.EmploymentStatus == "ACTIVE")
                .Select(e => e.Id)
                .ToListAsync();

            // Task assignments for these employees
            var pendingTasks = await _context.TaskAssignments
                .CountAsync(ta => employeeIds.Contains(ta.EmployeeId)
                                  && (ta.Status == "ASSIGNED" || ta.Status == "IN_PROGRESS"));

            var overdueTasks = await _context.TaskAssignments
                .CountAsync(ta => employeeIds.Contains(ta.EmployeeId)
                                  && ta.Deadline.HasValue
                                  && ta.Deadline < DateTimeOffset.UtcNow
                                  && ta.Status != "COMPLETED"
                                  && ta.Status != "CANCELLED");

            // Average enrollment progress
            var avgProgress = await _context.Enrollments
                .Where(en => employeeIds.Contains(en.EmployeeId))
                .AverageAsync(en => (double?)en.ProgressPercentage) ?? 0;

            // Risk items for this department
            var riskItems = await _context.TrainingRiskScores
                .Where(r => (r.RiskLevel == "HIGH" || r.RiskLevel == "CRITICAL")
                            && employeeIds.Contains(r.EmployeeId))
                .GroupBy(r => r.EmployeeId)
                .Select(g => new { EmployeeId = g.Key, RiskLevel = g.OrderByDescending(x => x.GeneratedAt).First().RiskLevel })
                .ToListAsync();

            var employeeNames = await _context.Employees
                .Where(e => riskItems.Select(r => r.EmployeeId).Contains(e.Id))
                .Select(e => new { e.Id, e.FullName })
                .ToListAsync();

            results.Add(new DepartmentDashboardResponse
            {
                DepartmentName = dept.Name,
                EmployeeCount = employeeIds.Count,
                PendingTasks = pendingTasks,
                OverdueTasks = overdueTasks,
                AvgProgress = Math.Round(avgProgress, 2),
                RiskItems = riskItems.Select(r => new DepartmentRiskItem
                {
                    EmployeeId = r.EmployeeId,
                    EmployeeName = employeeNames.FirstOrDefault(en => en.Id == r.EmployeeId)?.FullName ?? string.Empty,
                    RiskLevel = r.RiskLevel,
                }).ToList(),
            });
        }

        return results;
    }

    /// <summary>
    /// Trainer dashboard — courses, assessments, pass rates, active learners.
    /// </summary>
    public async Task<TrainerDashboardResponse> GetTrainerDashboardAsync()
    {
        if (!_currentUser.EmployeeId.HasValue)
            throw new InvalidOperationException("Current user has no linked employee profile.");

        var trainerEmployeeId = _currentUser.EmployeeId.Value;

        var ownedCourses = await _context.Courses
            .CountAsync(c => c.OwnerTrainerId == trainerEmployeeId);

        // Assessments linked to trainer's courses
        var trainerCourseIds = await _context.Courses
            .Where(c => c.OwnerTrainerId == trainerEmployeeId)
            .Select(c => c.Id)
            .ToListAsync();

        var totalAssessments = await _context.Assessments
            .CountAsync(a => trainerCourseIds.Contains(a.CourseId));

        // Average pass rate across completed attempts for trainer's assessments
        var assessmentIds = await _context.Assessments
            .Where(a => trainerCourseIds.Contains(a.CourseId))
            .Select(a => a.Id)
            .ToListAsync();

        var avgPassRate = await _context.AssessmentAttempts
            .Where(aa => assessmentIds.Contains(aa.AssessmentId) && (aa.Status == "SUBMITTED" || aa.Status == "GRADED"))
            .AverageAsync(aa => (double?)aa.Score) ?? 0;

        // Active learners (distinct) enrolled in trainer's courses
        var activeLearners = await _context.Enrollments
            .Where(en => trainerCourseIds.Contains(en.CourseId)
                         && (en.Status == "IN_PROGRESS" || en.Status == "ACTIVE"))
            .Select(en => en.EmployeeId)
            .Distinct()
            .CountAsync();

        return new TrainerDashboardResponse
        {
            OwnedCourses = ownedCourses,
            TotalAssessments = totalAssessments,
            AvgPassRate = Math.Round(avgPassRate, 2),
            ActiveLearners = activeLearners,
        };
    }

    /// <summary>
    /// Employee self-service dashboard.
    /// </summary>
    public async Task<EmployeeDashboardResponse> GetEmployeeDashboardAsync(Guid employeeId)
    {
        var enrolledCourses = await _context.Enrollments
            .CountAsync(e => e.EmployeeId == employeeId);

        var completedCourses = await _context.Enrollments
            .CountAsync(e => e.EmployeeId == employeeId && e.Status == "COMPLETED");

        var avgProgress = await _context.Enrollments
            .Where(e => e.EmployeeId == employeeId)
            .AverageAsync(e => (double?)e.ProgressPercentage) ?? 0;

        var validCertificates = await _context.Certificates
            .CountAsync(c => c.EmployeeId == employeeId
                             && c.Status == "VALID"
                             && (!c.ExpiresAt.HasValue || c.ExpiresAt > DateTimeOffset.UtcNow));

        var pendingTasks = await _context.TaskAssignments
            .CountAsync(ta => ta.EmployeeId == employeeId
                              && ta.Status != "COMPLETED"
                              && ta.Status != "CANCELLED");

        var latestRiskLevel = await _context.TrainingRiskScores
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => r.RiskLevel)
            .FirstOrDefaultAsync();

        return new EmployeeDashboardResponse
        {
            EnrolledCourses = enrolledCourses,
            CompletedCourses = completedCourses,
            AvgProgress = Math.Round(avgProgress, 2),
            ValidCertificates = validCertificates,
            PendingTasks = pendingTasks,
            LatestRiskLevel = latestRiskLevel,
        };
    }

    // ═══════════════════════════════════════
    // Dashboard Reports (Phase 7)
    // ═══════════════════════════════════════

    /// <summary>
    /// Competency heatmap — employee vs competency level matrix.
    /// </summary>
    public async Task<HeatmapResponse> GetCompetencyHeatmapAsync()
    {
        var profiles = await _context.EmployeeCompetencyProfiles
            .Include(p => p.Competency)
            .Include(p => p.Employee)
            .ToListAsync();

        // Get all position requirements to calculate gap
        var requirements = await _context.PositionCompetencyRequirements
            .Include(r => r.Competency)
            .ToListAsync();

        var employees = profiles
            .GroupBy(p => p.EmployeeId)
            .Select(g => g.First().Employee?.FullName ?? "Unknown")
            .Distinct()
            .ToList();

        var competencies = requirements
            .Select(r => r.Competency.Name)
            .Distinct()
            .ToList();

        var cells = new List<HeatmapCell>();

        foreach (var profile in profiles)
        {
            var empName = profile.Employee?.FullName ?? "Unknown";
            var compName = profile.Competency?.Name ?? "Unknown";

            var req = requirements
                .Where(r => r.CompetencyId == profile.CompetencyId)
                .OrderByDescending(r => r.RequiredLevelValue)
                .FirstOrDefault();

            var requiredLevel = req?.RequiredLevelValue ?? 0;
            var gapLevel = Math.Max(0, requiredLevel - profile.CurrentLevelValue);

            string priority = gapLevel >= 3 ? "HIGH"
                : gapLevel >= 2 ? "MEDIUM"
                : gapLevel >= 1 ? "LOW"
                : "NONE";

            cells.Add(new HeatmapCell
            {
                EmployeeName = empName,
                CompetencyName = compName,
                CurrentLevel = profile.CurrentLevelValue,
                RequiredLevel = requiredLevel,
                GapLevel = gapLevel,
                Priority = priority,
            });
        }

        return new HeatmapResponse
        {
            Employees = employees,
            Competencies = competencies,
            Cells = cells,
        };
    }

    /// <summary>
    /// Paginated risk list — high/critical risk employees.
    /// </summary>
    public async Task<PagedList<RiskItemResponse>> GetRiskListAsync(PaginationRequest request)
    {
        var query = _context.TrainingRiskScores
            .Where(r => r.RiskLevel == "HIGH" || r.RiskLevel == "CRITICAL");

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.RiskScore)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var employeeIds = items.Select(r => r.EmployeeId).Distinct().ToList();
        var employees = await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => new { e.FullName, e.DepartmentId });

        var deptIds = employees.Values.Select(e => e.DepartmentId).Distinct().ToList();
        var departments = await _context.Departments
            .Where(d => deptIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Name);

        return new PagedList<RiskItemResponse>
        {
            Items = items.Select(r =>
            {
                var emp = employees.GetValueOrDefault(r.EmployeeId);
                return new RiskItemResponse
                {
                    EmployeeId = r.EmployeeId,
                    EmployeeName = emp?.FullName ?? "Unknown",
                    DepartmentName = emp?.DepartmentId != null ? departments.GetValueOrDefault(emp.DepartmentId, "") : "",
                    RiskScore = r.RiskScore,
                    RiskLevel = r.RiskLevel,
                    GeneratedAt = r.GeneratedAt,
                };
            }).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    /// <summary>
    /// Certificate report — all certificates for reporting.
    /// </summary>
    public async Task<PagedList<CertificateReportRow>> GetCertificateReportAsync(PaginationRequest request)
    {
        var query = _context.Certificates.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(c => c.CertificateCode.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.IssuedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var employeeIds = items.Select(c => c.EmployeeId).Distinct().ToList();
        var employees = await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.FullName);

        return new PagedList<CertificateReportRow>
        {
            Items = items.Select(c => new CertificateReportRow
            {
                CertificateId = c.Id,
                EmployeeName = employees.GetValueOrDefault(c.EmployeeId, "Unknown"),
                CertificateType = c.CertificateCode,
                Status = c.Status,
                IssuedAt = c.IssuedAt,
                ExpiresAt = c.ExpiresAt,
                IssuedByUserName = null,
            }).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    /// <summary>
    /// Task performance report — aggregated per employee.
    /// </summary>
    public async Task<PagedList<TaskPerformanceRow>> GetTaskPerformanceReportAsync(PaginationRequest request)
    {
        // Scope: HR_MANAGER/SYS_ADMIN see all, DEPT_MANAGER sees own department
        var empQuery = _context.Employees.Where(e => e.EmploymentStatus == "ACTIVE").AsQueryable();

        var managedDeptIds = _currentUser.ManagedDepartmentIds;
        if (managedDeptIds.Count != 0
            && !_currentUser.Roles.Any(r => r == Shared.Constants.RoleConstants.SystemAdmin
                                         || r == Shared.Constants.RoleConstants.HRManager))
        {
            empQuery = empQuery.Where(e => managedDeptIds.Contains(e.DepartmentId));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            empQuery = empQuery.Where(e => e.FullName.ToLower().Contains(kw));
        }

        var totalItems = await empQuery.CountAsync();
        var employees = await empQuery
            .OrderBy(e => e.FullName)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var employeeIds = employees.Select(e => e.Id).ToList();
        var deptIds = employees.Select(e => e.DepartmentId).Distinct().ToList();
        var departments = await _context.Departments
            .Where(d => deptIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Name);

        var taskAssignments = await _context.TaskAssignments
            .Where(ta => employeeIds.Contains(ta.EmployeeId))
            .ToListAsync();

        var completedGroup = taskAssignments
            .Where(ta => ta.Status == "COMPLETED")
            .GroupBy(ta => ta.EmployeeId)
            .ToDictionary(g => g.Key, g => g.Count());

        var pendingGroup = taskAssignments
            .Where(ta => ta.Status != "COMPLETED" && ta.Status != "CANCELLED")
            .GroupBy(ta => ta.EmployeeId)
            .ToDictionary(g => g.Key, g => g.Count());

        // Get average scores
        var completedAssignmentIds = taskAssignments
            .Where(ta => ta.Status == "COMPLETED")
            .Select(ta => ta.Id)
            .ToList();

        var evaluations = await _context.TaskEvaluations
            .Where(te => completedAssignmentIds.Contains(te.TaskAssignmentId))
            .GroupBy(te => te.TaskAssignmentId)
            .ToDictionaryAsync(g => g.Key, g => g.Average(te => te.TaskScore));

        return new PagedList<TaskPerformanceRow>
        {
            Items = employees.Select(e =>
            {
                var empAssignments = taskAssignments.Where(ta => ta.EmployeeId == e.Id).ToList();
                var avgScore = empAssignments
                    .Where(ta => evaluations.ContainsKey(ta.Id))
                    .Select(ta => (double)evaluations[ta.Id])
                    .DefaultIfEmpty(0)
                    .Average();

                var avgOverdueDays = empAssignments
                    .Where(ta => ta.Deadline.HasValue && ta.Deadline < DateTimeOffset.UtcNow && ta.Status == "COMPLETED")
                    .Select(ta => (DateTimeOffset.UtcNow - ta.Deadline!.Value).TotalDays)
                    .DefaultIfEmpty(0)
                    .Average();

                return new TaskPerformanceRow
                {
                    EmployeeId = e.Id,
                    EmployeeName = e.FullName ?? "",
                    DepartmentName = departments.GetValueOrDefault(e.DepartmentId, ""),
                    CompletedTasks = completedGroup.GetValueOrDefault(e.Id, 0),
                    PendingTasks = pendingGroup.GetValueOrDefault(e.Id, 0),
                    AvgScore = Math.Round(avgScore, 2),
                    AvgOverdueDays = Math.Round(avgOverdueDays, 2),
                };
            }).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }
}
