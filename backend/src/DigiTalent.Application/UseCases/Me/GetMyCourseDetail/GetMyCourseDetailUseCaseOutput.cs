namespace DigiTalent.Application.UseCases.Me;

public class GetMyCourseDetailUseCaseOutput
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Purpose { get; set; }
    public short Level { get; set; }
    public short? EntryLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public bool CertificateEnabled { get; set; }
    public int? CertificateValidityDays { get; set; }
    public string? CategoryName { get; set; }

    public List<MyCompetencyRefDto> Competencies { get; set; } = new();
    public List<MyLearningOutcomeDto> Outcomes { get; set; } = new();
    public List<MyPrerequisiteDto> Prerequisites { get; set; } = new();

    /// <summary>null = chưa ghi danh (chỉ xem đề cương).</summary>
    public MyEnrollmentDto? Enrollment { get; set; }

    public List<MyCourseModuleDto> Modules { get; set; } = new();
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }

    /// <summary>Bài nên học tiếp (bài bắt buộc chưa xong đầu tiên) — null khi chưa có bài học.</summary>
    public Guid? NextLessonId { get; set; }

    public List<MyAssessmentCardDto> Assessments { get; set; } = new();

    public bool CanEnroll { get; set; }
    public string? EnrollBlockedReason { get; set; }

    public MyCertificateRefDto? Certificate { get; set; }
}

public class MyLearningOutcomeDto
{
    public string Code { get; set; } = string.Empty;
    public string Statement { get; set; } = string.Empty;
    public string OutcomeType { get; set; } = string.Empty;
    public short TargetLevel { get; set; }
}

public class MyEnrollmentDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? DueDate { get; set; }
    public bool IsOverdue { get; set; }

    /// <summary>ASSIGNED | SELF_ENROLLED</summary>
    public string Source { get; set; } = string.Empty;

    public string? AssignedByName { get; set; }
}

public class MyCourseModuleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRequired { get; set; }
    public List<MyCourseLessonDto> Lessons { get; set; } = new();
}

public class MyCourseLessonDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public int? EstimatedMinutes { get; set; }
    public bool IsRequired { get; set; }
    public string CompletionRule { get; set; } = string.Empty;

    /// <summary>Nhân viên tự đánh dấu hoàn thành được (VIEW / MANUAL_COMPLETE).</summary>
    public bool SelfCompletable { get; set; }

    /// <summary>NOT_STARTED | IN_PROGRESS | COMPLETED</summary>
    public string ProgressStatus { get; set; } = string.Empty;

    public DateTimeOffset? CompletedAt { get; set; }
}

public class MyCertificateRefDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
