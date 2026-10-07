namespace DigiTalent.Application.UseCases.Me;

public class GetMyDashboardUseCaseOutput
{
    public MyEmployeeInfoDto Employee { get; set; } = new();
    public MyDashboardCompetencyDto Competency { get; set; } = new();
    public MyCourseSummaryDto Courses { get; set; } = new();
    public MyContinueLearningDto? ContinueLearning { get; set; }
    public MyTaskSummaryDto Tasks { get; set; } = new();
    public List<MyTaskCardDto> ActiveTasks { get; set; } = new();
    public MyAssessmentSummaryDto Assessments { get; set; } = new();

    /// <summary>Bài đánh giá nên làm tiếp (đang làm dở → bài cuối khóa đã mở → bài khác).</summary>
    public MyAssessmentCardDto? NextAssessment { get; set; }

    public int ValidCertificates { get; set; }
    public List<MyDeadlineDto> UpcomingDeadlines { get; set; } = new();
}

public class MyDashboardCompetencyDto
{
    public string? SkipReason { get; set; }
    public MyCompetencySummaryDto? Summary { get; set; }

    /// <summary>Trung bình mức đã xác nhận / mức yêu cầu trên các năng lực của vị trí.</summary>
    public decimal? AverageCurrentLevel { get; set; }

    public decimal? AverageRequiredLevel { get; set; }
    public List<MyCompetencyLineDto> TopGaps { get; set; } = new();
}

public class MyContinueLearningDto
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public int CompletedLessons { get; set; }
    public int TotalLessons { get; set; }
    public Guid? NextLessonId { get; set; }
    public string? NextLessonTitle { get; set; }
    public string? DueDate { get; set; }
    public bool IsOverdue { get; set; }
}

public class MyDeadlineDto
{
    /// <summary>COURSE | TASK</summary>
    public string Kind { get; set; } = string.Empty;

    /// <summary>CourseId (COURSE) hoặc AssignmentId (TASK).</summary>
    public Guid TargetId { get; set; }

    public string Title { get; set; } = string.Empty;
    public DateTimeOffset DueAt { get; set; }
    public bool IsOverdue { get; set; }
}
