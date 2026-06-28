using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.Tasks.DTOs;
using DigiTalent.Domain.Entities.Competency;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Tasks.Services;

public class TaskService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;
    private readonly INotificationHubService _notificationHub;

    public TaskService(
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
    // Practical Tasks
    // ═══════════════════════════════════════

    public async Task<PagedList<PracticalTaskResponse>> SearchTasksAsync(PaginationRequest request)
    {
        var query = _context.PracticalTasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(kw)
                                  || t.Description.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new PracticalTaskResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                SourceType = t.SourceType,
                RelatedCourseId = t.RelatedCourseId,
                CompetencyId = t.CompetencyId,
                CreatedAt = t.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<PracticalTaskResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<PracticalTaskDetailResponse> GetTaskAsync(Guid taskId)
    {
        var task = await _context.PracticalTasks
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Practical task not found.");

        return new PracticalTaskDetailResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            SourceType = task.SourceType,
            RelatedCourseId = task.RelatedCourseId,
            CompetencyId = task.CompetencyId,
            ExpectedOutput = task.ExpectedOutput,
            EvaluationCriteria = task.EvaluationCriteria,
            AssignmentCount = task.Assignments.Count,
            CreatedAt = task.CreatedAt,
        };
    }

    public async Task<PracticalTaskResponse> CreateTaskAsync(CreateTaskRequest request)
    {
        // Verify competency exists
        var competencyExists = await _context.Competencies.AnyAsync(c => c.Id == request.CompetencyId);
        if (!competencyExists)
            throw new KeyNotFoundException("Competency not found.");

        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Task.PracticalTask
        {
            OrganizationId = orgId,
            CompetencyId = request.CompetencyId,
            RelatedCourseId = request.RelatedCourseId,
            Title = request.Title,
            Description = request.Description,
            ExpectedOutput = request.ExpectedOutput,
            EvaluationCriteria = request.EvaluationCriteria,
            SourceType = "MANUAL",
            Status = "DRAFT",
        };
        _context.PracticalTasks.Add(entity);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "CreateTask",
            entityType: "PracticalTask",
            entityId: entity.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(request));

        return new PracticalTaskResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            SourceType = entity.SourceType,
            RelatedCourseId = entity.RelatedCourseId,
            CompetencyId = entity.CompetencyId,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<PracticalTaskResponse> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request)
    {
        var task = await _context.PracticalTasks
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Practical task not found.");

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.ExpectedOutput != null) task.ExpectedOutput = request.ExpectedOutput;
        if (request.EvaluationCriteria != null) task.EvaluationCriteria = request.EvaluationCriteria;
        if (request.Status != null) task.Status = request.Status;

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "UpdateTask",
            entityType: "PracticalTask",
            entityId: task.Id);

        return new PracticalTaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            SourceType = task.SourceType,
            RelatedCourseId = task.RelatedCourseId,
            CompetencyId = task.CompetencyId,
            CreatedAt = task.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Task Assignments
    // ═══════════════════════════════════════

    public async Task<TaskAssignmentResponse> AssignTaskAsync(Guid taskId, AssignTaskRequest request)
    {
        var task = await _context.PracticalTasks
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Practical task not found.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        if (!_currentUser.EmployeeId.HasValue)
            throw new InvalidOperationException("Current user has no associated employee record.");

        var entity = new Domain.Entities.Task.TaskAssignment
        {
            TaskId = taskId,
            Task = task,
            EmployeeId = request.EmployeeId,
            Employee = employee,
            AssignedByUserId = _currentUser.UserId ?? Guid.Empty,
            ManagerEmployeeId = _currentUser.EmployeeId.Value,
            Deadline = request.Deadline,
            Status = "ASSIGNED",
            ProgressPercent = 0,
            AssignedAt = DateTimeOffset.UtcNow,
        };
        _context.TaskAssignments.Add(entity);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "AssignTask",
            entityType: "TaskAssignment",
            entityId: entity.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(new { taskId, employeeId = request.EmployeeId }));

        return new TaskAssignmentResponse
        {
            Id = entity.Id,
            TaskId = entity.TaskId,
            TaskTitle = task.Title,
            EmployeeId = entity.EmployeeId,
            EmployeeName = $"{employee.FullName} {employee.FullName}".Trim(),
            Status = entity.Status,
            ProgressPercent = entity.ProgressPercent,
            Deadline = entity.Deadline,
            AssignedAt = entity.AssignedAt,
        };
    }

    public async Task<PagedList<TaskAssignmentResponse>> SearchAssignmentsAsync(PaginationRequest request)
    {
        var query = _context.TaskAssignments
            .Include(a => a.Task)
            .Include(a => a.Employee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(a => a.Task.Title.ToLower().Contains(kw)
                                  || (a.Employee.FullName + " " + a.Employee.FullName).ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.AssignedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new TaskAssignmentResponse
            {
                Id = a.Id,
                TaskId = a.TaskId,
                TaskTitle = a.Task.Title,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FullName + " " + a.Employee.FullName,
                Status = a.Status,
                ProgressPercent = a.ProgressPercent,
                Deadline = a.Deadline,
                AssignedAt = a.AssignedAt,
            })
            .ToListAsync();

        return new PagedList<TaskAssignmentResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<TaskAssignmentDetailResponse> GetAssignmentAsync(Guid assignmentId)
    {
        var assignment = await _context.TaskAssignments
            .Include(a => a.Task)
            .Include(a => a.Employee)
            .Include(a => a.Submissions)
            .Include(a => a.Evaluations)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Task assignment not found.");

        var latestEvaluation = assignment.Evaluations
            .OrderByDescending(e => e.EvaluatedAt)
            .FirstOrDefault();

        return new TaskAssignmentDetailResponse
        {
            Id = assignment.Id,
            TaskId = assignment.TaskId,
            TaskTitle = assignment.Task.Title,
            EmployeeId = assignment.EmployeeId,
            EmployeeName = $"{assignment.Employee.FullName} {assignment.Employee.FullName}".Trim(),
            Status = assignment.Status,
            ProgressPercent = assignment.ProgressPercent,
            Deadline = assignment.Deadline,
            AssignedAt = assignment.AssignedAt,
            Submissions = assignment.Submissions.OrderBy(s => s.SubmittedAt).Select(s => new TaskSubmissionResponse
            {
                Id = s.Id,
                TaskAssignmentId = s.TaskAssignmentId,
                SubmissionText = s.SubmissionText,
                SubmittedAt = s.SubmittedAt,
                Status = s.Status,
            }).ToList(),
            LatestEvaluation = latestEvaluation != null ? new TaskEvaluationResponse
            {
                Id = latestEvaluation.Id,
                TaskAssignmentId = latestEvaluation.TaskAssignmentId,
                TaskScore = latestEvaluation.TaskScore,
                Feedback = latestEvaluation.Feedback,
                EvaluationStatus = latestEvaluation.EvaluationStatus,
                EvaluatedAt = latestEvaluation.EvaluatedAt,
            } : null,
        };
    }

    // ═══════════════════════════════════════
    // Task Submissions
    // ═══════════════════════════════════════

    public async Task<TaskSubmissionResponse> SubmitTaskAsync(Guid assignmentId, SubmitTaskRequest request)
    {
        var assignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Task assignment not found.");

        if (assignment.Status == "REVIEWED" || assignment.Status == "CANCELLED")
            throw new InvalidOperationException($"Cannot submit to assignment with status '{assignment.Status}'.");

        var entity = new Domain.Entities.Task.TaskSubmission
        {
            TaskAssignmentId = assignmentId,
            TaskAssignment = assignment,
            SubmittedByUserId = _currentUser.UserId ?? Guid.Empty,
            SubmissionText = request.SubmissionText,
            SubmittedAt = DateTimeOffset.UtcNow,
            Status = "SUBMITTED",
        };
        _context.TaskSubmissions.Add(entity);

        // Update assignment status
        assignment.Status = "SUBMITTED";
        assignment.ProgressPercent = Math.Min(assignment.ProgressPercent + 25, 100);

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "SubmitTask",
            entityType: "TaskSubmission",
            entityId: entity.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(new { assignmentId }));

        return new TaskSubmissionResponse
        {
            Id = entity.Id,
            TaskAssignmentId = entity.TaskAssignmentId,
            SubmissionText = entity.SubmissionText,
            SubmittedAt = entity.SubmittedAt,
            Status = entity.Status,
        };
    }

    // ═══════════════════════════════════════
    // Task Evaluations
    // ═══════════════════════════════════════

    public async Task<TaskEvaluationResponse> EvaluateTaskAsync(Guid assignmentId, EvaluateTaskRequest request)
    {
        var assignment = await _context.TaskAssignments
            .Include(a => a.Task)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Task assignment not found.");

        if (assignment.Status != "SUBMITTED")
            throw new InvalidOperationException($"Cannot evaluate assignment with status '{assignment.Status}'. Only SUBMITTED assignments can be evaluated.");

        var entity = new Domain.Entities.Task.TaskEvaluation
        {
            TaskAssignmentId = assignmentId,
            TaskAssignment = assignment,
            EvaluatorUserId = _currentUser.UserId ?? Guid.Empty,
            TaskScore = request.TaskScore,
            Feedback = request.Feedback,
            ConfirmedCompetencyId = request.ConfirmedCompetencyId ?? assignment.Task.CompetencyId,
            ConfirmedLevelValue = request.ConfirmedLevelValue,
            EvaluationStatus = request.EvaluationStatus,
            EvaluatedAt = DateTimeOffset.UtcNow,
        };
        _context.TaskEvaluations.Add(entity);

        // Create CompetencyEvidence if confirmedCompetencyId is provided
        if (request.ConfirmedCompetencyId.HasValue)
        {
            var evidence = new CompetencyEvidence
            {
                EmployeeId = assignment.EmployeeId,
                CompetencyId = request.ConfirmedCompetencyId.Value,
                EvidenceType = "TASK_EVALUATION",
                SourceEntityType = "TaskEvaluation",
                SourceEntityId = entity.Id,
                EvidenceScore = request.TaskScore,
                ConfirmedLevelValue = request.ConfirmedLevelValue,
                VerifiedByUserId = _currentUser.UserId,
                Status = "CONFIRMED",
                Notes = request.Feedback,
            };
            _context.CompetencyEvidences.Add(evidence);
        }

        // Update assignment status to REVIEWED
        assignment.Status = "REVIEWED";
        assignment.ProgressPercent = 100;

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "EvaluateTask",
            entityType: "TaskEvaluation",
            entityId: entity.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(
                new { assignmentId, score = request.TaskScore, evaluationStatus = request.EvaluationStatus }));

        return new TaskEvaluationResponse
        {
            Id = entity.Id,
            TaskAssignmentId = entity.TaskAssignmentId,
            TaskScore = entity.TaskScore,
            Feedback = entity.Feedback,
            EvaluationStatus = entity.EvaluationStatus,
            EvaluatedAt = entity.EvaluatedAt,
        };
    }

    public async Task ReopenTaskAsync(Guid assignmentId)
    {
        var assignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Task assignment not found.");

        if (assignment.Status != "REVIEWED")
            throw new InvalidOperationException($"Cannot reopen assignment with status '{assignment.Status}'. Only REVIEWED assignments can be reopened.");

        assignment.Status = "ASSIGNED";
        assignment.ProgressPercent = 0;

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "ReopenTask",
            entityType: "TaskAssignment",
            entityId: assignment.Id);
    }

    public async Task UpdateAssignmentStatusAsync(Guid assignmentId, string newStatus)
    {
        var assignment = await _context.TaskAssignments
            .Include(a => a.Task)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Task assignment not found.");

        var validStatuses = new[] { "ACCEPTED", "IN_PROGRESS", "CANCELLED" };
        if (!validStatuses.Contains(newStatus))
            throw new ArgumentException($"Invalid status '{newStatus}'. Valid statuses: {string.Join(", ", validStatuses)}");

        assignment.Status = newStatus;
        if (newStatus == "ACCEPTED") assignment.ProgressPercent = Math.Max(assignment.ProgressPercent, 10);
        if (newStatus == "CANCELLED") assignment.ProgressPercent = 0;

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "UpdateTaskStatus",
            entityType: "TaskAssignment",
            entityId: assignment.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(new { status = newStatus }));

        // SignalR: notify assignee about task status change
        try
        {
            var assigneeUser = await _context.Employees
                .Where(e => e.Id == assignment.EmployeeId)
                .Select(e => e.UserId)
                .FirstOrDefaultAsync();
            if (assigneeUser.HasValue)
            {
                await _notificationHub.SendTaskStatusChanged(assigneeUser.Value, new
                {
                    assignment.Id,
                    TaskTitle = assignment.Task.Title,
                    newStatus,
                });
            }
        }
        catch { /* SignalR non-critical */ }
    }
}
