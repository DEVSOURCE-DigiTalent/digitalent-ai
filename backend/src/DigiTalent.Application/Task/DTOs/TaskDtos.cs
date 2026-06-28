namespace DigiTalent.Application.Tasks.DTOs;

public class PracticalTaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "DRAFT";
    public string SourceType { get; set; } = "MANUAL";
    public Guid? RelatedCourseId { get; set; }
    public Guid CompetencyId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class PracticalTaskDetailResponse : PracticalTaskResponse
{
    public string ExpectedOutput { get; set; } = string.Empty;
    public string EvaluationCriteria { get; set; } = "{}";
    public int AssignmentCount { get; set; }
}

public class CreateTaskRequest
{
    public Guid CompetencyId { get; set; }
    public Guid? RelatedCourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public string EvaluationCriteria { get; set; } = "{}";
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ExpectedOutput { get; set; }
    public string? EvaluationCriteria { get; set; }
    public string? Status { get; set; }
}

// ═══════════════════════════════════════
// Task Assignments
// ═══════════════════════════════════════

public class TaskAssignmentResponse
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Status { get; set; } = "ASSIGNED";
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? Deadline { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
}

public class TaskAssignmentDetailResponse : TaskAssignmentResponse
{
    public List<TaskSubmissionResponse> Submissions { get; set; } = new();
    public TaskEvaluationResponse? LatestEvaluation { get; set; }
}

public class AssignTaskRequest
{
    public Guid EmployeeId { get; set; }
    public DateTimeOffset? Deadline { get; set; }
}

// ═══════════════════════════════════════
// Task Submissions
// ═══════════════════════════════════════

public class TaskSubmissionResponse
{
    public Guid Id { get; set; }
    public Guid TaskAssignmentId { get; set; }
    public string? SubmissionText { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Status { get; set; } = "SUBMITTED";
}

public class SubmitTaskRequest
{
    public string? SubmissionText { get; set; }
}

// ═══════════════════════════════════════
// Task Evaluations
// ═══════════════════════════════════════

public class TaskEvaluationResponse
{
    public Guid Id { get; set; }
    public Guid TaskAssignmentId { get; set; }
    public decimal TaskScore { get; set; }
    public string? Feedback { get; set; }
    public string EvaluationStatus { get; set; } = "PASSED";
    public DateTimeOffset EvaluatedAt { get; set; }
}

public class TaskStatusUpdateRequest
{
    public string Status { get; set; } = string.Empty;
}

public class EvaluateTaskRequest
{
    public decimal TaskScore { get; set; }
    public string? Feedback { get; set; }
    public string EvaluationStatus { get; set; } = "PASSED";
    public Guid? ConfirmedCompetencyId { get; set; }
    public int? ConfirmedLevelValue { get; set; }
}
