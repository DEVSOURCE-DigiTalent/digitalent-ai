namespace DigiTalent.Application.UseCases.Pulse;

public class DecidePulseFinalUseCaseOutput
{
    public Guid SubmissionId { get; set; }
    public string Decision { get; set; } = string.Empty;
    /// <summary>Trạng thái bài cuối sau quyết định: APPROVED | RETRY_WAIT | FLAGGED.</summary>
    public string Status { get; set; } = string.Empty;
    public string EnrollmentStatus { get; set; } = string.Empty;
    public DateTimeOffset? RetryOpensAt { get; set; }
    public DateTimeOffset? RetryDueAt { get; set; }
}
