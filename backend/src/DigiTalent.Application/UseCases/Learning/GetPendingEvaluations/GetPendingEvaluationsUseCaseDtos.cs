namespace DigiTalent.Application.UseCases.Learning;

public class GetPendingEvaluationsUseCaseInput
{
}

public class GetPendingEvaluationsUseCaseOutput
{
    public List<PendingEvaluationDto> Enrollments { get; set; } = new();
}

public class PendingEvaluationDto
{
    public Guid EnrollmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public decimal? BestQuizScore { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
}
