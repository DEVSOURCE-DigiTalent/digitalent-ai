using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.TrainingBatches;

// ── List ──
public class GetTrainingBatchesInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? CourseId { get; set; }
    public Guid? DepartmentId { get; set; }
}

public class GetTrainingBatchesOutput : PagedList<TrainingBatchListItem> { }

public class TrainingBatchListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? CourseName { get; set; }
    public string? DepartmentName { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalEmployees { get; set; }
    public int CompletedCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

// ── Summary ──
public class GetTrainingBatchSummaryInput { }

public class TrainingBatchSummaryDto
{
    public int Total { get; set; }
    public int Running { get; set; }
    public int Scheduled { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int TotalParticipants { get; set; }
}

// ── Detail ──
public class GetTrainingBatchByIdInput
{
    public Guid Id { get; set; }
}

public class TrainingBatchDetailDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CourseId { get; set; }
    public string? CourseName { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CreatedByName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<BatchEmployeeDto> Employees { get; set; } = new();
}

public class BatchEmployeeDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? CourseAssignmentId { get; set; }
    public int ProgressPercent { get; set; }
}

// ── Create ──
public class CreateTrainingBatchInput
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CourseId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public List<Guid> EmployeeIds { get; set; } = new();
}

public class CreateTrainingBatchOutput
{
    public Guid Id { get; set; }
    public int EmployeesAdded { get; set; }
}

// ── Update ──
public class UpdateTrainingBatchInput
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public class UpdateTrainingBatchOutput
{
    public bool Success { get; set; }
}

// ── Cancel / Complete ──
public class ActivateTrainingBatchInput
{
    public Guid Id { get; set; }
}

public class ActivateTrainingBatchOutput
{
    public bool Success { get; set; }
}

public class CancelTrainingBatchInput
{
    public Guid Id { get; set; }
}

public class CancelTrainingBatchOutput
{
    public bool Success { get; set; }
}

public class CompleteTrainingBatchInput
{
    public Guid Id { get; set; }
}

public class CompleteTrainingBatchOutput
{
    public bool Success { get; set; }
}

// ── Add employees ──
public class AddBatchEmployeesInput
{
    public Guid BatchId { get; set; }
    public List<Guid> EmployeeIds { get; set; } = new();
}

public class AddBatchEmployeesOutput
{
    public int Added { get; set; }
}

// ── Remove employee ──
public class RemoveBatchEmployeeInput
{
    public Guid BatchId { get; set; }
    public Guid EmployeeId { get; set; }
}

public class RemoveBatchEmployeeOutput
{
    public bool Success { get; set; }
}
