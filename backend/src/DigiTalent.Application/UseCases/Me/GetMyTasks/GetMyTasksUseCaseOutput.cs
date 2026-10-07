namespace DigiTalent.Application.UseCases.Me;

public class GetMyTasksUseCaseOutput
{
    public List<MyTaskCardDto> Items { get; set; } = new();
    public MyTaskSummaryDto Summary { get; set; } = new();
}

public class MyTaskSummaryDto
{
    public int Total { get; set; }

    /// <summary>Cần làm: ASSIGNED + NEEDS_REVISION.</summary>
    public int ToDo { get; set; }

    public int PendingReview { get; set; }
    public int NeedsRevision { get; set; }
    public int Passed { get; set; }
    public int Failed { get; set; }
    public int Overdue { get; set; }
}

public class MyTaskCardDto
{
    /// <summary>task_assignments.id — định danh nhiệm vụ trên các trang /enterprise/me/tasks/:id.</summary>
    public Guid AssignmentId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;

    /// <summary>ASSIGNED | SUBMITTED | NEEDS_REVISION | PASSED | FAILED</summary>
    public string Status { get; set; } = string.Empty;

    public bool IsOverdue { get; set; }
    public bool CanSubmit { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset? DueAt { get; set; }
    public string? AssignedByName { get; set; }
    public string? ReviewerName { get; set; }
    public string? CourseTitle { get; set; }
    public short TargetLevel { get; set; }
    public List<MyCompetencyRefDto> Targets { get; set; } = new();
    public int SubmissionCount { get; set; }
    public MyTaskSubmissionDto? LatestSubmission { get; set; }

    public static T Map<T>(MyTask task, DateTimeOffset now) where T : MyTaskCardDto, new() => new()
    {
        AssignmentId = task.Assignment.Id,
        Title = task.Assignment.TitleSnapshot,
        Description = task.Assignment.DescriptionSnapshot,
        ExpectedOutput = task.Assignment.ExpectedOutputSnapshot,
        Status = task.Assignment.Status,
        IsOverdue = task.IsOverdue(now),
        CanSubmit = task.CanSubmit,
        AssignedAt = task.Assignment.AssignedAt,
        DueAt = task.Assignment.DueAt,
        AssignedByName = task.AssignedByName,
        ReviewerName = task.ReviewerName,
        CourseTitle = task.CourseTitle,
        TargetLevel = task.Targets.Count == 0 ? (short)0 : task.Targets.Max(t => t.TargetLevel),
        Targets = task.Targets.Select(t => new MyCompetencyRefDto
        {
            CompetencyId = t.CompetencyId,
            Code = t.Code,
            Name = t.Name,
            TargetLevel = t.TargetLevel,
        }).ToList(),
        SubmissionCount = task.Submissions.Count,
        LatestSubmission = task.Latest == null ? null : MyTaskSubmissionDto.From(task.Latest),
    };
}
