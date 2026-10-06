namespace DigiTalent.Application.UseCases.Learning.MyLearning;

public class GetMyLearningInput
{
    public string? Status { get; set; }
}

public class MyCourseItem
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseDescription { get; set; }
    public int Level { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int TotalModules { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? DueDate { get; set; }
    public bool Overdue { get; set; }
    public string? AssignedByName { get; set; }
}

public class GetMyLearningOutput
{
    public List<MyCourseItem> Items { get; set; } = new();
    public int Total { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
    public int NotStarted { get; set; }
}
