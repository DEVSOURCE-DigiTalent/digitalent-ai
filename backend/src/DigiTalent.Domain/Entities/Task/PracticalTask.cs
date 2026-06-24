using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Task;

public class PracticalTask : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public Guid? RelatedCourseId { get; set; }
    public Guid CompetencyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public string EvaluationCriteria { get; set; } = "{}";
    public string SourceType { get; set; } = "MANUAL";
    public string Status { get; set; } = "DRAFT";

    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
}

public class TaskAssignment : AuditableEntity
{
    public Guid TaskId { get; set; }
    public PracticalTask Task { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public Organization.Employee Employee { get; set; } = null!;
    public Guid AssignedByUserId { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public DateTimeOffset? Deadline { get; set; }
    public string Status { get; set; } = "ASSIGNED";
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset AssignedAt { get; set; }

    public ICollection<TaskSubmission> Submissions { get; set; } = new List<TaskSubmission>();
    public ICollection<TaskEvaluation> Evaluations { get; set; } = new List<TaskEvaluation>();
}

public class TaskSubmission : AuditableEntity
{
    public Guid TaskAssignmentId { get; set; }
    public TaskAssignment TaskAssignment { get; set; } = null!;
    public Guid SubmittedByUserId { get; set; }
    public string? SubmissionText { get; set; }
    public Guid? FileObjectId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Status { get; set; } = "SUBMITTED";
}

public class TaskEvaluation : AuditableEntity
{
    public Guid TaskAssignmentId { get; set; }
    public TaskAssignment TaskAssignment { get; set; } = null!;
    public Guid EvaluatorUserId { get; set; }
    public decimal TaskScore { get; set; }
    public string? Feedback { get; set; }
    public Guid ConfirmedCompetencyId { get; set; }
    public int? ConfirmedLevelValue { get; set; }
    public string EvaluationStatus { get; set; } = "PASSED";
    public DateTimeOffset EvaluatedAt { get; set; }
}
