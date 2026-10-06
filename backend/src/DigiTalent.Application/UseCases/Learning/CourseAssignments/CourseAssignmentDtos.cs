namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

// ── List ──

public class GetCourseAssignmentsInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? CourseId { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public bool? Overdue { get; set; }
    public bool? DueSoon { get; set; }
}

public class AssignmentRow
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTimeOffset AssignedAt { get; set; }
    public string AssignedByName { get; set; } = string.Empty;
    public string? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? CancelReason { get; set; }
    public string Source { get; set; } = "MANUAL";
    public bool Overdue { get; set; }
    public bool DueSoon { get; set; }
}

public class GetCourseAssignmentsOutput
{
    public List<AssignmentRow> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}

// ── Summary ──

public class GetAssignmentSummaryInput { }

public class DepartmentSummary
{
    public Guid DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
    public int AverageProgress { get; set; }
}

public class AssignmentSummaryOutput
{
    public int Total { get; set; }
    public int NotStarted { get; set; }
    public int InProgress { get; set; }
    public int ReadyForAssessment { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
    public int DueSoon { get; set; }
    public decimal CompletionRate { get; set; }
    public List<DepartmentSummary> ByDepartment { get; set; } = new();
}

// ── Create ──

public class CreateAssignmentTargets
{
    public List<Guid>? EmployeeIds { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? JobGrade { get; set; }
}

public class CreateCourseAssignmentInput
{
    public Guid CourseId { get; set; }
    public string? DueDate { get; set; }
    public CreateAssignmentTargets Targets { get; set; } = new();
}

public class SkippedEmployee
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class CreateCourseAssignmentOutput
{
    public List<AssignmentRow> Created { get; set; } = new();
    public List<SkippedEmployee> Skipped { get; set; } = new();
}

// ── Cancel ──

public class CancelCourseAssignmentInput
{
    public Guid Id { get; set; }
    public string? Reason { get; set; }
}

public class CancelCourseAssignmentOutput
{
    public Guid Id { get; set; }
}
