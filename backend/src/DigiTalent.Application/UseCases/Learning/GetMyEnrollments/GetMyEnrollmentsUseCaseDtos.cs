namespace DigiTalent.Application.UseCases.Learning;

public class GetMyEnrollmentsUseCaseInput
{
}

public class GetMyEnrollmentsUseCaseOutput
{
    public List<EnrollmentSummaryDto> Enrollments { get; set; } = new();
}

public class EnrollmentSummaryDto
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateOnly? DueDate { get; set; }
}
