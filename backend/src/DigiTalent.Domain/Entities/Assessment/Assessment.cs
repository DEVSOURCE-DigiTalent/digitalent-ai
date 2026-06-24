using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Assessment;

public class QuestionBank : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? OwnerTrainerId { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}

public class Question : AuditableEntity
{
    public Guid BankId { get; set; }
    public QuestionBank Bank { get; set; } = null!;
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public string Status { get; set; } = "DRAFT";

    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}

public class QuestionOption : AuditableEntity
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class Assessment : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Learning.Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = "QUIZ";
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public decimal PassingScore { get; set; }
    public string Status { get; set; } = "DRAFT";

    public ICollection<AssessmentQuestion> AssessmentQuestions { get; set; } = new List<AssessmentQuestion>();
    public ICollection<AssessmentAttempt> Attempts { get; set; } = new List<AssessmentAttempt>();
}

public class AssessmentQuestion : AuditableEntity
{
    public Guid AssessmentId { get; set; }
    public Assessment Assessment { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public decimal ScoreWeight { get; set; }
    public int SortOrder { get; set; }
}

public class AssessmentAttempt : AuditableEntity
{
    public Guid AssessmentId { get; set; }
    public Assessment Assessment { get; set; } = null!;
    public Guid EnrollmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public int AttemptNo { get; set; }
    public string Status { get; set; } = "IN_PROGRESS";
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public decimal? Score { get; set; }
    public bool? Passed { get; set; }

    public ICollection<AssessmentAnswer> Answers { get; set; } = new List<AssessmentAnswer>();
}

public class AssessmentAnswer : AuditableEntity
{
    public Guid AttemptId { get; set; }
    public AssessmentAttempt Attempt { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
    public bool? IsCorrect { get; set; }
    public decimal? ScoreAwarded { get; set; }
    public Guid? GradedByUserId { get; set; }
}
