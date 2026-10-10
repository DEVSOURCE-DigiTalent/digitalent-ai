namespace DigiTalent.Application.UseCases.Learning;

public class GetCourseStructureUseCaseInput
{
    public Guid CourseId { get; set; }
}

public class GetCourseStructureUseCaseOutput
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? EnrollmentId { get; set; }
    public string? EnrollmentStatus { get; set; }
    public decimal CourseProgressPercent { get; set; }
    public List<ModuleDto> Modules { get; set; } = new();
    public List<CourseAssessmentDto> Assessments { get; set; } = new();
}

public class ModuleDto
{
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
}

public class LessonDto
{
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int? EstimatedMinutes { get; set; }
    public string ProgressStatus { get; set; } = "NOT_STARTED";
    public decimal ProgressPercent { get; set; }
}

public class CourseAssessmentDto
{
    public Guid AssessmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public decimal PassingScore { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public int AttemptsUsed { get; set; }
    public decimal? BestScore { get; set; }
    public bool? Passed { get; set; }
}
