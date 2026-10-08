namespace DigiTalent.Application.UseCases.Learning.Courses;

public class GetCourseByIdUseCaseInput
{
    public Guid Id { get; set; }
}

public class LessonDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string CompletionRule { get; set; } = string.Empty;
}

public class CourseModuleDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public int LessonsCount { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
}

public class CourseDetailDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Purpose { get; set; }
    public int Level { get; set; }
    public short? EntryLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public bool CertificateEnabled { get; set; }
    public int? CertificateValidityDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public Guid? PrerequisiteCourseId { get; set; }
    public string? PrerequisiteTitle { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public List<CourseModuleDto> Modules { get; set; } = new();
}
