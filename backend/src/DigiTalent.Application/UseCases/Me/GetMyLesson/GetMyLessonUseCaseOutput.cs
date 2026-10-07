namespace DigiTalent.Application.UseCases.Me;

public class GetMyLessonUseCaseOutput
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public string ModuleTitle { get; set; } = string.Empty;

    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRequired { get; set; }
    public string CompletionRule { get; set; } = string.Empty;
    public bool SelfCompletable { get; set; }

    public List<MyLearningMaterialDto> Materials { get; set; } = new();

    /// <summary>NOT_STARTED | IN_PROGRESS | COMPLETED</summary>
    public string ProgressStatus { get; set; } = string.Empty;

    public DateTimeOffset? CompletedAt { get; set; }

    public int LessonIndex { get; set; }
    public int TotalLessons { get; set; }
    public Guid? PrevLessonId { get; set; }
    public Guid? NextLessonId { get; set; }

    public string EnrollmentStatus { get; set; } = string.Empty;
    public decimal CourseProgressPercent { get; set; }
}

public class MyLearningMaterialDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>FILE | LINK</summary>
    public string MaterialType { get; set; } = string.Empty;

    public string? ExternalUrl { get; set; }
    public string? FileName { get; set; }
    public long? SizeBytes { get; set; }
    public bool IsRequired { get; set; }
}
