namespace DigiTalent.Application.UseCases.Me;

public class GetMyCoursesUseCaseOutput
{
    public List<MyCourseCardDto> Items { get; set; } = new();
    public MyCourseSummaryDto Summary { get; set; } = new();
}

public class MyCourseSummaryDto
{
    public int Total { get; set; }
    public int NotStarted { get; set; }
    public int InProgress { get; set; }
    public int ReadyForAssessment { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
}

public class MyCourseCardDto
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CategoryName { get; set; }
    public short Level { get; set; }
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>NOT_STARTED | IN_PROGRESS | READY_FOR_ASSESSMENT | COMPLETED</summary>
    public string Status { get; set; } = string.Empty;

    public decimal ProgressPercent { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? DueDate { get; set; }
    public bool IsOverdue { get; set; }

    /// <summary>ASSIGNED | SELF_ENROLLED</summary>
    public string Source { get; set; } = string.Empty;

    public string? AssignedByName { get; set; }
    public string? CertificateCode { get; set; }

    public static MyCourseCardDto From(MyCourseRow row, DateOnly today) => new()
    {
        EnrollmentId = row.Enrollment.Id,
        CourseId = row.Course.Id,
        CourseCode = row.Course.Code,
        CourseTitle = row.Course.Title,
        Description = row.Course.Description,
        CategoryName = row.CategoryName,
        Level = row.Level,
        EstimatedDurationMinutes = row.Course.EstimatedDurationMinutes,
        Status = row.Enrollment.Status,
        ProgressPercent = row.Enrollment.ProgressPercent,
        TotalLessons = row.TrackedLessons,
        CompletedLessons = row.CompletedTrackedLessons,
        StartedAt = row.Enrollment.StartedAt,
        CompletedAt = row.Enrollment.CompletedAt,
        DueDate = row.Enrollment.DueDate?.ToString("yyyy-MM-dd"),
        IsOverdue = row.IsOverdue(today),
        Source = row.Source,
        AssignedByName = row.AssignedByName,
        CertificateCode = row.Certificate?.CertificateCode,
    };
}
