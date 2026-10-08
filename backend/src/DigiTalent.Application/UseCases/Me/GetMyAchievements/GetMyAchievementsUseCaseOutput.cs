namespace DigiTalent.Application.UseCases.Me;

public class GetMyAchievementsUseCaseOutput
{
    public MyAchievementStatsDto Stats { get; set; } = new();
    public List<MyCertificateDto> Certificates { get; set; } = new();
    public List<MyConfirmedCompetencyDto> ConfirmedCompetencies { get; set; } = new();
    public List<MyMilestoneDto> Milestones { get; set; } = new();
}

public class MyAchievementStatsDto
{
    public int ValidCertificates { get; set; }
    public int CompletedCourses { get; set; }
    public int PassedAssessments { get; set; }
    public int ApprovedTasks { get; set; }
    public int ConfirmedCompetencies { get; set; }
}

public class MyCertificateDto
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string HolderName { get; set; } = string.Empty;
    public Guid? CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? PrimaryCompetency { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }

    /// <summary>VALID | EXPIRED (đã quá expires_at) | REVOKED</summary>
    public string Status { get; set; } = string.Empty;

    public string? RevocationReason { get; set; }
    public decimal? Score { get; set; }
}

public class MyMilestoneDto
{
    /// <summary>CERTIFICATE_ISSUED | COURSE_COMPLETED | ASSESSMENT_PASSED | TASK_APPROVED | COMPETENCY_CONFIRMED</summary>
    public string Kind { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
}
