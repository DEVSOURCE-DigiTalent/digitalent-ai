using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Me;

public class GetMyAttemptHistoryUseCaseOutput : PagedList<MyAttemptHistoryRowDto>
{
}

public class MyAttemptHistoryRowDto
{
    public Guid AttemptId { get; set; }
    public Guid AssessmentId { get; set; }
    public string AssessmentTitle { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int AttemptNo { get; set; }

    /// <summary>STARTED | SUBMITTED | SCORED</summary>
    public string Status { get; set; } = string.Empty;

    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public int DurationSeconds { get; set; }
    public decimal? Score { get; set; }
    public decimal PassingScore { get; set; }
    public bool? Passed { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
}
