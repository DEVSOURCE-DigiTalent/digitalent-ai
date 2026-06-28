using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.Intelligence.DTOs;
using DigiTalent.Domain.Entities.Intelligence;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Intelligence.Services;

public class IntelligenceService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;
    private readonly INotificationHubService _notificationHub;

    public IntelligenceService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        AuditLogService auditLog,
        INotificationHubService notificationHub)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
        _notificationHub = notificationHub;
    }

    // ═══════════════════════════════════════
    // Skill Gap
    // ═══════════════════════════════════════

    public async Task<SkillGapResultResponse> CalculateSkillGapAsync(Guid employeeId, Guid positionId)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found");
        var position = await _context.JobPositions.FindAsync(positionId)
            ?? throw new KeyNotFoundException($"Job position {positionId} not found");

        var requirements = await _context.PositionCompetencyRequirements
            .Where(r => r.JobPositionId == positionId)
            .Include(r => r.Competency)
            .ToListAsync();

        var profiles = await _context.EmployeeCompetencyProfiles
            .Where(p => p.EmployeeId == employeeId)
            .ToListAsync();

        var result = new SkillGapResult
        {
            EmployeeId = employeeId,
            JobPositionId = positionId,
            GeneratedAt = DateTimeOffset.UtcNow,
            GeneratedBy = _currentUser.FullName ?? "SYSTEM",
        };

        decimal totalWeight = requirements.Sum(r => r.Weight);
        if (totalWeight == 0) totalWeight = 1;

        foreach (var req in requirements)
        {
            var profile = profiles.FirstOrDefault(p => p.CompetencyId == req.CompetencyId);
            int currentLevel = profile?.CurrentLevelValue ?? 0;
            int gapLevel = Math.Max(0, req.RequiredLevelValue - currentLevel);

            string priority = gapLevel >= 3 || req.IsMandatory
                ? "HIGH"
                : gapLevel >= 2
                    ? "MEDIUM"
                    : gapLevel >= 1
                        ? "LOW"
                        : "NONE";

            string? action = gapLevel > 0
                ? $"Improve {req.Competency.Name} from level {currentLevel} to {req.RequiredLevelValue}"
                : null;

            result.Items.Add(new SkillGapItem
            {
                CompetencyId = req.CompetencyId,
                RequiredLevelValue = req.RequiredLevelValue,
                CurrentLevelValue = currentLevel,
                GapLevel = gapLevel,
                Priority = priority,
                RecommendedAction = action,
            });
        }

        result.OverallGapScore = result.Items
            .Where(i => i.GapLevel > 0)
            .Sum(i =>
            {
                var req = requirements.First(r => r.CompetencyId == i.CompetencyId);
                return (decimal)i.GapLevel * req.Weight / totalWeight;
            });

        _context.SkillGapResults.Add(result);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "CALCULATE_SKILL_GAP", "SkillGapResult", result.Id);

        return MapToSkillGapResultResponse(result, requirements);
    }

    public async Task<SkillGapResultResponse> GetLatestSkillGapAsync(Guid employeeId)
    {
        var result = await _context.SkillGapResults
            .Where(r => r.EmployeeId == employeeId)
            .Include(r => r.Items)
            .OrderByDescending(r => r.GeneratedAt)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"No skill gap result found for employee {employeeId}");

        var requirements = await _context.PositionCompetencyRequirements
            .Where(r => r.JobPositionId == result.JobPositionId)
            .Include(r => r.Competency)
            .ToListAsync();

        return MapToSkillGapResultResponse(result, requirements);
    }

    // ═══════════════════════════════════════
    // Learning Recommendations
    // ═══════════════════════════════════════

    public async Task<List<LearningRecommendationResponse>> GenerateLearningRecommendationsAsync(Guid employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found");

        var latestGap = await _context.SkillGapResults
            .Where(r => r.EmployeeId == employeeId)
            .Include(r => r.Items)
            .OrderByDescending(r => r.GeneratedAt)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException(
                $"No skill gap data for employee {employeeId}. Calculate skill gap first.");

        var gapCompetencyIds = latestGap.Items
            .Where(i => i.GapLevel > 0)
            .Select(i => i.CompetencyId)
            .ToList();

        if (gapCompetencyIds.Count == 0)
            return new List<LearningRecommendationResponse>();

        var courseCompetencies = await _context.CourseCompetencies
            .Where(cc => gapCompetencyIds.Contains(cc.CompetencyId))
            .Include(cc => cc.Course)
            .Include(cc => cc.Competency)
            .ToListAsync();

        // Avoid re-recommending already-recommended courses
        var existingCourseIds = await _context.LearningRecommendations
            .Where(r => r.EmployeeId == employeeId)
            .Select(r => r.CourseId)
            .ToListAsync();

        var newRecommendations = courseCompetencies
            .Where(cc => !existingCourseIds.Contains(cc.CourseId))
            .ToList();

        if (newRecommendations.Count == 0)
            return new List<LearningRecommendationResponse>();

        int maxGap = latestGap.Items.Max(i => i.GapLevel);
        if (maxGap == 0) maxGap = 1;

        var recommendations = new List<LearningRecommendation>();
        foreach (var cc in newRecommendations)
        {
            var gapItem = latestGap.Items.First(i => i.CompetencyId == cc.CompetencyId);
            decimal priority = (decimal)gapItem.GapLevel / maxGap;

            recommendations.Add(new LearningRecommendation
            {
                EmployeeId = employeeId,
                SourceSkillGapResultId = latestGap.Id,
                CourseId = cc.CourseId,
                PriorityScore = priority,
                Reason = $"Covers {cc.Competency?.Name ?? "competency"} gap (target level {cc.TargetLevelValue})",
                Status = "NEW",
            });
        }

        _context.LearningRecommendations.AddRange(recommendations);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "GENERATE_LEARNING_RECOMMENDATIONS", "LearningRecommendation", null);

        return recommendations.Select(MapToLearningRecommendationResponse).ToList();
    }

    public async Task<List<LearningRecommendationResponse>> GetLearningRecommendationsAsync(Guid employeeId)
    {
        var recommendations = await _context.LearningRecommendations
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.PriorityScore)
            .ToListAsync();

        var courseIds = recommendations.Select(r => r.CourseId).Distinct().ToList();
        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Title);

        return recommendations.Select(r => new LearningRecommendationResponse
        {
            Id = r.Id,
            CourseId = r.CourseId,
            CourseTitle = courses.GetValueOrDefault(r.CourseId, "Unknown"),
            PriorityScore = r.PriorityScore,
            Reason = r.Reason,
            Status = r.Status,
        }).ToList();
    }

    // ═══════════════════════════════════════
    // Training Risk
    // ═══════════════════════════════════════

    public async Task<TrainingRiskDetailResponse> CalculateTrainingRiskAsync(Guid employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found");

        var enrollments = await _context.Enrollments
            .Where(e => e.EmployeeId == employeeId)
            .ToListAsync();

        var now = DateTimeOffset.UtcNow;
        int totalEnrollments = enrollments.Count;

        // Inactivity score: started but no significant progress
        int inactiveCount = enrollments.Count(e =>
            e.StartedAt != null && e.CompletedAt == null && e.ProgressPercentage < 10);
        decimal inactivityScore = totalEnrollments > 0
            ? (decimal)inactiveCount / totalEnrollments * 100
            : 0;

        // Progress delay: started but below 50% completion
        int delayedCount = enrollments.Count(e =>
            e.StartedAt != null && e.ProgressPercentage < 50);
        decimal progressDelay = totalEnrollments > 0
            ? (decimal)delayedCount / totalEnrollments * 100
            : 0;

        // Deadline pressure: approaching due date with incomplete progress
        int deadlineCount = enrollments.Count(e =>
            e.DueDate.HasValue
            && e.ProgressPercentage < 100
            && DateOnly.FromDateTime(now.DateTime) >= e.DueDate.Value.AddDays(-7));
        decimal deadlinePressure = totalEnrollments > 0
            ? (decimal)deadlineCount / totalEnrollments * 100
            : 0;

        // Assessment attempts for this employee
        var attempts = await _context.AssessmentAttempts
            .Where(a => a.EmployeeId == employeeId)
            .ToListAsync();

        int totalAttempts = attempts.Count;

        // Low score rate: attempts with score < 50
        int lowScoreCount = attempts.Count(a => a.Score.HasValue && a.Score < 50);
        decimal lowScoreRate = totalAttempts > 0
            ? (decimal)lowScoreCount / totalAttempts * 100
            : 0;

        // Failed attempt rate
        int failedCount = attempts.Count(a => a.Passed == false);
        decimal failedAttemptRate = totalAttempts > 0
            ? (decimal)failedCount / totalAttempts * 100
            : 0;

        // Weighted composite risk score
        decimal riskScore = (inactivityScore * 0.25m)
                          + (progressDelay * 0.25m)
                          + (deadlinePressure * 0.15m)
                          + (lowScoreRate * 0.20m)
                          + (failedAttemptRate * 0.15m);

        string riskLevel = riskScore >= 70 ? "HIGH"
            : riskScore >= 40 ? "MEDIUM"
            : "LOW";

        var riskEntity = new TrainingRiskScore
        {
            EnrollmentId = Guid.Empty,
            EmployeeId = employeeId,
            RiskScore = Math.Round(riskScore, 2),
            RiskLevel = riskLevel,
            InactivityScore = Math.Round(inactivityScore, 2),
            LowScoreRate = Math.Round(lowScoreRate, 2),
            DeadlinePressure = Math.Round(deadlinePressure, 2),
            FailedAttemptRate = Math.Round(failedAttemptRate, 2),
            ProgressDelay = Math.Round(progressDelay, 2),
            GeneratedAt = now,
        };

        _context.TrainingRiskScores.Add(riskEntity);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "CALCULATE_TRAINING_RISK", "TrainingRiskScore", riskEntity.Id);

        // SignalR: notify relevant managers/HR about high risk
        try
        {
            if (riskLevel == "HIGH" || riskLevel == "MEDIUM")
            {
                var empDeptId = employee.DepartmentId;
                // Find managers/HR via UserRole linking
                var mgmtRoleIds = await _context.Roles
                    .Where(r => r.Code == "HR_MANAGER" || r.Code == "DEPARTMENT_MANAGER")
                    .Select(r => r.Id)
                    .ToListAsync();
                var mgmtUserIds = await _context.UserRoles
                    .Where(ur => mgmtRoleIds.Contains(ur.RoleId))
                    .Select(ur => ur.UserId)
                    .Distinct()
                    .ToListAsync();
                foreach (var uid in mgmtUserIds)
                {
                    await _notificationHub.SendTrainingRiskRaised(uid, new
                    {
                        EmployeeId = employeeId,
                        EmployeeName = employee.FullName ?? "",
                        riskEntity.RiskScore,
                        riskEntity.RiskLevel,
                        riskEntity.GeneratedAt,
                    });
                }
            }
        }
        catch { /* SignalR non-critical */ }

        return MapToTrainingRiskDetailResponse(riskEntity, employee.FullName ?? "");
    }

    public async Task<TrainingRiskDetailResponse> GetLatestTrainingRiskAsync(Guid employeeId)
    {
        var risk = await _context.TrainingRiskScores
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.GeneratedAt)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"No training risk score found for employee {employeeId}");

        var employee = await _context.Employees.FindAsync(employeeId);

        return MapToTrainingRiskDetailResponse(risk, employee?.FullName ?? "");
    }

    // ═══════════════════════════════════════
    // Readiness Score
    // ═══════════════════════════════════════

    public async Task<ReadinessScoreResponse> CalculateReadinessAsync(Guid employeeId, Guid positionId)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found");
        var position = await _context.JobPositions.FindAsync(positionId)
            ?? throw new KeyNotFoundException($"Job position {positionId} not found");

        // ── Competency score (35%) ──
        var requirements = await _context.PositionCompetencyRequirements
            .Where(r => r.JobPositionId == positionId)
            .ToListAsync();

        var profiles = await _context.EmployeeCompetencyProfiles
            .Where(p => p.EmployeeId == employeeId)
            .ToListAsync();

        decimal competencyScore = 0;
        if (requirements.Count > 0)
        {
            int matched = requirements.Count(req =>
            {
                var profile = profiles.FirstOrDefault(p => p.CompetencyId == req.CompetencyId);
                return profile != null && profile.CurrentLevelValue >= req.RequiredLevelValue;
            });
            competencyScore = (decimal)matched / requirements.Count * 100;
        }

        // ── Certificate score (20%) ──
        int validCertCount = await _context.Certificates
            .CountAsync(c => c.EmployeeId == employeeId && c.Status == "VALID");
        decimal certificateScore = Math.Min(validCertCount * 25m, 100);

        // ── Learning progress score (15%) ──
        var enrollments = await _context.Enrollments
            .Where(e => e.EmployeeId == employeeId)
            .ToListAsync();
        decimal learningProgressScore = enrollments.Count > 0
            ? (decimal)Math.Round(enrollments.Average(e => e.ProgressPercentage), 2)
            : 0;

        // ── Compliance score (15%) ──
        var mandatoryReqs = requirements.Where(r => r.IsMandatory).ToList();
        decimal complianceScore = 100;
        if (mandatoryReqs.Count > 0)
        {
            int completed = mandatoryReqs.Count(req =>
            {
                var profile = profiles.FirstOrDefault(p => p.CompetencyId == req.CompetencyId);
                return profile != null && profile.CurrentLevelValue >= req.RequiredLevelValue;
            });
            complianceScore = (decimal)completed / mandatoryReqs.Count * 100;
        }

        // ── Task performance score (15%) ──
        var taskAssignmentIds = await _context.TaskAssignments
            .Where(ta => ta.EmployeeId == employeeId)
            .Select(ta => (Guid?)ta.Id)
            .ToListAsync();

        decimal taskPerformanceScore = 0;
        if (taskAssignmentIds.Count > 0)
        {
            var taskEvals = await _context.TaskEvaluations
                .Where(te => taskAssignmentIds.Contains((Guid?)te.TaskAssignmentId))
                .ToListAsync();

            if (taskEvals.Count > 0)
            {
                taskPerformanceScore = Math.Min(
                    (decimal)Math.Round(taskEvals.Average(te => te.TaskScore), 2), 100);
            }
        }

        // ── Weighted total ──
        decimal totalScore = Math.Round(
            (competencyScore * 0.35m)
            + (certificateScore * 0.20m)
            + (learningProgressScore * 0.15m)
            + (complianceScore * 0.15m)
            + (taskPerformanceScore * 0.15m), 2);

        string readinessLevel = totalScore >= 80 ? "READY"
            : totalScore >= 60 ? "NEARLY_READY"
            : totalScore >= 40 ? "MODERATE"
            : "NOT_READY";

        var readiness = new ReadinessScore
        {
            EmployeeId = employeeId,
            JobPositionId = positionId,
            CompetencyScore = competencyScore,
            CertificateScore = certificateScore,
            LearningProgressScore = learningProgressScore,
            ComplianceScore = complianceScore,
            TaskPerformanceScore = taskPerformanceScore,
            TotalScore = totalScore,
            ReadinessLevel = readinessLevel,
            GeneratedAt = DateTimeOffset.UtcNow,
        };

        _context.ReadinessScores.Add(readiness);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "CALCULATE_READINESS", "ReadinessScore", readiness.Id);

        return MapToReadinessScoreResponse(readiness, employee.FullName, position.Title);
    }

    public async Task<ReadinessScoreResponse> GetLatestReadinessAsync(Guid employeeId)
    {
        var score = await _context.ReadinessScores
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.GeneratedAt)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"No readiness score found for employee {employeeId}");

        var employee = await _context.Employees.FindAsync(employeeId);
        var position = await _context.JobPositions.FindAsync(score.JobPositionId);

        return MapToReadinessScoreResponse(
            score,
            employee?.FullName ?? "",
            position?.Title ?? "");
    }

    // ═══════════════════════════════════════
    // Career Readiness
    // ═══════════════════════════════════════

    public async Task<CareerReadinessResponse> GetCareerReadinessAsync(Guid employeeId, Guid targetPositionId)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found");
        var targetPosition = await _context.JobPositions.FindAsync(targetPositionId)
            ?? throw new KeyNotFoundException($"Target position {targetPositionId} not found");

        var requirements = await _context.PositionCompetencyRequirements
            .Where(r => r.JobPositionId == targetPositionId)
            .ToListAsync();

        var profiles = await _context.EmployeeCompetencyProfiles
            .Where(p => p.EmployeeId == employeeId)
            .ToListAsync();

        if (requirements.Count == 0)
        {
            return new CareerReadinessResponse
            {
                EmployeeId = employeeId,
                TargetJobPositionId = targetPositionId,
                TargetPositionTitle = targetPosition.Title,
                ReadinessPercent = 0,
                MissingWeight = 0,
                RecommendationText = "No competency requirements defined for this position.",
                GeneratedAt = DateTimeOffset.UtcNow,
            };
        }

        decimal totalWeight = requirements.Sum(r => r.Weight);
        if (totalWeight == 0) totalWeight = 1;

        decimal matchedWeight = 0;
        decimal missingWeight = 0;

        foreach (var req in requirements)
        {
            var profile = profiles.FirstOrDefault(p => p.CompetencyId == req.CompetencyId);

            if (profile != null && profile.CurrentLevelValue >= req.RequiredLevelValue)
                matchedWeight += req.Weight;
            else
                missingWeight += req.Weight;
        }

        decimal readinessPercent = Math.Round(matchedWeight / totalWeight * 100, 2);

        string? recommendation = readinessPercent >= 80
            ? $"Employee is well-prepared for {targetPosition.Title}"
            : readinessPercent >= 50
                ? $"Employee needs improvement in key areas to qualify for {targetPosition.Title}"
                : $"Employee requires significant development to qualify for {targetPosition.Title}";

        return new CareerReadinessResponse
        {
            EmployeeId = employeeId,
            TargetJobPositionId = targetPositionId,
            TargetPositionTitle = targetPosition.Title,
            ReadinessPercent = readinessPercent,
            MissingWeight = Math.Round(missingWeight, 2),
            RecommendationText = recommendation,
            GeneratedAt = DateTimeOffset.UtcNow,
        };
    }

    // ═══════════════════════════════════════
    // Search / List methods (paginated)
    // ═══════════════════════════════════════

    public async Task<PagedList<SkillGapResultResponse>> SearchSkillGapsAsync(PaginationRequest request)
    {
        var query = _context.SkillGapResults
            .Include(r => r.Items)
            .AsQueryable();

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.GeneratedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        // Load requirements for each result
        var positionIds = items.Select(i => i.JobPositionId).Distinct().ToList();
        var requirements = await _context.PositionCompetencyRequirements
            .Where(r => positionIds.Contains(r.JobPositionId))
            .Include(r => r.Competency)
            .ToListAsync();

        return new PagedList<SkillGapResultResponse>
        {
            Items = items.Select(r => MapToSkillGapResultResponse(r, requirements)).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<PagedList<LearningRecommendationResponse>> SearchLearningRecommendationsAsync(PaginationRequest request)
    {
        var query = _context.LearningRecommendations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(r => r.Reason.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.PriorityScore)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var courseIds = items.Select(r => r.CourseId).Distinct().ToList();
        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Title);

        return new PagedList<LearningRecommendationResponse>
        {
            Items = items.Select(r => new LearningRecommendationResponse
            {
                Id = r.Id,
                CourseId = r.CourseId,
                CourseTitle = courses.GetValueOrDefault(r.CourseId, "Unknown"),
                PriorityScore = r.PriorityScore,
                Reason = r.Reason,
                Status = r.Status,
            }).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<PagedList<TrainingRiskDetailResponse>> SearchTrainingRisksAsync(PaginationRequest request)
    {
        var query = _context.TrainingRiskScores.AsQueryable();

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.GeneratedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var employeeIds = items.Select(r => r.EmployeeId).Distinct().ToList();
        var employees = await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.FullName);

        return new PagedList<TrainingRiskDetailResponse>
        {
            Items = items.Select(r => MapToTrainingRiskDetailResponse(r, employees.GetValueOrDefault(r.EmployeeId, ""))).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<PagedList<ReadinessScoreResponse>> SearchReadinessAsync(PaginationRequest request)
    {
        var query = _context.ReadinessScores.AsQueryable();

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.GeneratedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var employeeIds = items.Select(r => r.EmployeeId).Distinct().ToList();
        var employees = await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.FullName);

        var positionIds = items.Select(r => r.JobPositionId).Distinct().ToList();
        var positions = await _context.JobPositions
            .Where(p => positionIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Title);

        return new PagedList<ReadinessScoreResponse>
        {
            Items = items.Select(r => MapToReadinessScoreResponse(
                r,
                employees.GetValueOrDefault(r.EmployeeId, ""),
                positions.GetValueOrDefault(r.JobPositionId, ""))).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    // ═══════════════════════════════════════
    // Private Mapping Helpers
    // ═══════════════════════════════════════

    private static SkillGapResultResponse MapToSkillGapResultResponse(
        SkillGapResult result,
        List<Domain.Entities.Competency.PositionCompetencyRequirement> requirements)
    {
        var compNames = requirements
            .GroupBy(r => r.CompetencyId)
            .ToDictionary(g => g.Key, g => g.First().Competency.Name);

        return new SkillGapResultResponse
        {
            Id = result.Id,
            EmployeeId = result.EmployeeId,
            JobPositionId = result.JobPositionId,
            OverallGapScore = Math.Round(result.OverallGapScore, 2),
            GeneratedAt = result.GeneratedAt,
            Items = result.Items.Select(i => new SkillGapItemResponse
            {
                CompetencyId = i.CompetencyId,
                CompetencyName = compNames.GetValueOrDefault(i.CompetencyId, "Unknown"),
                RequiredLevel = i.RequiredLevelValue,
                CurrentLevel = i.CurrentLevelValue,
                GapLevel = i.GapLevel,
                Priority = i.Priority,
                RecommendedAction = i.RecommendedAction,
            }).ToList(),
        };
    }

    private static LearningRecommendationResponse MapToLearningRecommendationResponse(
        LearningRecommendation rec)
    {
        return new LearningRecommendationResponse
        {
            Id = rec.Id,
            CourseId = rec.CourseId,
            CourseTitle = "",
            PriorityScore = rec.PriorityScore,
            Reason = rec.Reason,
            Status = rec.Status,
        };
    }

    private static TrainingRiskDetailResponse MapToTrainingRiskDetailResponse(
        TrainingRiskScore entity, string employeeName)
    {
        return new TrainingRiskDetailResponse
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = employeeName,
            RiskScore = entity.RiskScore,
            RiskLevel = entity.RiskLevel,
            GeneratedAt = entity.GeneratedAt,
            InactivityScore = entity.InactivityScore,
            LowScoreRate = entity.LowScoreRate,
            DeadlinePressure = entity.DeadlinePressure,
            FailedAttemptRate = entity.FailedAttemptRate,
            ProgressDelay = entity.ProgressDelay,
        };
    }

    private static ReadinessScoreResponse MapToReadinessScoreResponse(
        ReadinessScore entity, string employeeName, string positionTitle)
    {
        return new ReadinessScoreResponse
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = employeeName,
            JobPositionId = entity.JobPositionId,
            PositionTitle = positionTitle,
            CompetencyScore = entity.CompetencyScore,
            CertificateScore = entity.CertificateScore,
            LearningProgressScore = entity.LearningProgressScore,
            ComplianceScore = entity.ComplianceScore,
            TaskPerformanceScore = entity.TaskPerformanceScore,
            TotalScore = entity.TotalScore,
            ReadinessLevel = entity.ReadinessLevel,
            GeneratedAt = entity.GeneratedAt,
        };
    }
}
