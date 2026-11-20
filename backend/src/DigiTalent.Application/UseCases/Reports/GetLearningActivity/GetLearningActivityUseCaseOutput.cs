namespace DigiTalent.Application.UseCases.Reports.GetLearningActivity;

/// <summary>How the employees in scope use the courses: who learns now, what was finished, week by week.</summary>
/// <param name="Learners">Employees with at least one course open (in progress or waiting for its final).</param>
/// <param name="Weeks">Oldest first; a week starts on Monday (UTC).</param>
/// <param name="Recent">The latest completions, newest first.</param>
public sealed record GetLearningActivityOutput(
    int Employees,
    int Learners,
    int InProgress,
    int Completed,
    int CompletedLast30Days,
    IReadOnlyList<LearningActivityWeek> Weeks,
    IReadOnlyList<LearningActivityCompletion> Recent);

public sealed record LearningActivityWeek(DateOnly WeekStart, int Started, int Completed);

/// <param name="DomainNumber">1–6 when the course is one of the 18 standard courses.</param>
/// <param name="Level">1 Cơ bản, 2 Trung cấp, 3 Nâng cao, for a standard course.</param>
public sealed record LearningActivityCompletion(
    Guid EmployeeId, string EmployeeName, string CourseTitle, int? DomainNumber, int? Level, DateTimeOffset CompletedAt);
