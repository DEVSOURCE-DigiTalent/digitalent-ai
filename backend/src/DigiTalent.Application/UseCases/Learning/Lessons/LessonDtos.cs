namespace DigiTalent.Application.UseCases.Learning.Lessons;

// ── Get lesson content ──

public class GetLessonInput
{
    public Guid Id { get; set; }
}

public class LessonContentOutput
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string CompletionRule { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public string ModuleTitle { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
}

// ── Complete lesson ──

public class CompleteLessonInput
{
    public Guid LessonId { get; set; }
}

public class CompleteLessonOutput
{
    public Guid LessonId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public decimal CourseProgressPercent { get; set; }
}
