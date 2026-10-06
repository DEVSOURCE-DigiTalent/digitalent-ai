using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Tasks;

// ──────────────── Inputs ────────────────

public class GetTasksInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? DepartmentId { get; set; }
}

public class GetTaskByIdInput { public Guid Id { get; set; } }

public class CreateTaskInput
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public List<Guid> CompetencyIds { get; set; } = new();
    public short TargetLevel { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public List<Guid> AssignedEmployeeIds { get; set; } = new();
    public DateTimeOffset? DueDate { get; set; }
    public string? RubricCriteria { get; set; }
}

public class GetReviewQueueInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
}

public class GetSubmissionDetailInput { public Guid Id { get; set; } }

public class EvaluateSubmissionInput
{
    public Guid SubmissionId { get; set; }
    public decimal Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public string? RubricScores { get; set; }
    public string Decision { get; set; } = string.Empty;
}

public class SubmitTaskEvidenceInput
{
    public Guid TaskId { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<string>? LinkUrls { get; set; }
    public List<string>? FileUrls { get; set; }
}

public class GetMyTasksInput { }
public class GetMyEvidenceInput { }

// ──────────────── Outputs ────────────────

public class PracticalTaskListItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public List<Guid> CompetencyIds { get; set; } = new();
    public short TargetLevel { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
    public int AssignedEmployeesCount { get; set; }
    public Guid? AssignedByEmployeeId { get; set; }
    public string? AssignedByName { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
    public string? DueDate { get; set; }
    public string? RubricCriteria { get; set; }
    public string Status { get; set; } = string.Empty;
    public int SubmissionsCount { get; set; }
    public int PendingReviewCount { get; set; }
    public int ApprovedCount { get; set; }
}

public class GetTasksOutput : PagedList<PracticalTaskListItem> { }

public class AssignedEmployeeDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
}

public class TaskSubmissionDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<string>? FileUrls { get; set; }
    public List<string>? LinkUrls { get; set; }
    public string Status { get; set; } = string.Empty;
    public EvaluationDto? Evaluation { get; set; }
}

public class EvaluationDto
{
    public string EvaluatedBy { get; set; } = string.Empty;
    public DateTimeOffset EvaluatedAt { get; set; }
    public decimal Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public string? RubricScores { get; set; }
    public string Decision { get; set; } = string.Empty;
}

public class PracticalTaskDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public List<Guid> CompetencyIds { get; set; } = new();
    public short TargetLevel { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
    public List<Guid> AssignedEmployeeIds { get; set; } = new();
    public int AssignedEmployeesCount { get; set; }
    public Guid? AssignedByEmployeeId { get; set; }
    public string? AssignedByName { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
    public string? DueDate { get; set; }
    public string? RubricCriteria { get; set; }
    public string Status { get; set; } = string.Empty;
    public int SubmissionsCount { get; set; }
    public int PendingReviewCount { get; set; }
    public int ApprovedCount { get; set; }
    public List<AssignedEmployeeDto> AssignedEmployees { get; set; } = new();
    public List<TaskSubmissionDto> Submissions { get; set; } = new();
}

public class ReviewQueueItemDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string? TaskDueDate { get; set; }
    public short TargetLevel { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<string> LinkUrls { get; set; } = new();
    public string Status { get; set; } = string.Empty;
}

public class GetReviewQueueOutput : PagedList<ReviewQueueItemDto> { }

public class SubmissionDetailDto : TaskSubmissionDto
{
    public string? TaskTitle { get; set; }
    public string? TaskDescription { get; set; }
    public string? TaskExpectedOutput { get; set; }
    public string? TaskDueDate { get; set; }
    public string? RubricCriteria { get; set; }
    public short TargetLevel { get; set; }
    public string? DepartmentName { get; set; }
}

public class LearnerTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public List<Guid> CompetencyIds { get; set; } = new();
    public short TargetLevel { get; set; }
    public string? AssignedByName { get; set; }
    public string? DueDate { get; set; }
    public string? RubricCriteria { get; set; }
    public TaskSubmissionDto? Submission { get; set; }
}

public class GetMyTasksOutput
{
    public List<LearnerTaskDto> Items { get; set; } = new();
    public int Total { get; set; }
}

public class EvidenceItemDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string? TaskDescription { get; set; }
    public short TargetLevel { get; set; }
    public List<Guid> CompetencyIds { get; set; } = new();
    public DateTimeOffset SubmittedAt { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<string> LinkUrls { get; set; } = new();
    public List<string> FileUrls { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public EvaluationDto? Evaluation { get; set; }
}

public class GetMyEvidenceOutput
{
    public List<EvidenceItemDto> Items { get; set; } = new();
    public int Total { get; set; }
}
