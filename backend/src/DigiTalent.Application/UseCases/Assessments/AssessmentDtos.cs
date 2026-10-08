using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Assessments;

// ──────────────── Question Bank ────────────────

public class GetQuestionBanksInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
}
public class GetQuestionBanksOutput : PagedList<QuestionBankDto> { }

public class QuestionBankDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class GetQuestionBankByIdInput { public Guid Id { get; set; } }
public class CreateQuestionBankInput
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? OwnerTrainerId { get; set; }
}
public class UpdateQuestionBankInput
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
}
public class DeleteQuestionBankInput { public Guid Id { get; set; } }
public class DeleteQuestionBankOutput { public bool Success { get; set; } }

// ──────────────── Questions ────────────────

public class QuestionOptionDto
{
    public Guid? Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = string.Empty;
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class GetQuestionsInput
{
    public Guid BankId { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
}
public class GetQuestionsOutput : PagedList<QuestionDto> { }

public class GetQuestionByIdInput { public Guid Id { get; set; } }

public class CreateQuestionInput
{
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public string? Status { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class UpdateQuestionInput
{
    public Guid Id { get; set; }
    public Guid? CompetencyId { get; set; }
    public string? QuestionType { get; set; }
    public string? Difficulty { get; set; }
    public string? Content { get; set; }
    public string? Explanation { get; set; }
    public List<QuestionOptionDto>? Options { get; set; }
}

public class DeleteQuestionInput { public Guid Id { get; set; } }
public class DeleteQuestionOutput { public bool Success { get; set; } }

public class ChangeQuestionStatusInput
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
public class ChangeQuestionStatusOutput { public bool Success { get; set; } }

public class ApproveQuestionInput
{
    public Guid Id { get; set; }
    public string? Comment { get; set; }
}

// ──────────────── Assessment (exam) ────────────────

public class GetAssessmentByIdInput { public Guid Id { get; set; } }

public class AssessmentQuestionDto
{
    public Guid Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string? CompetencyCode { get; set; }
}

public class AssessmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string? CourseCode { get; set; }
    public string? CourseTitle { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public decimal PassPercentage { get; set; }
    public List<AssessmentQuestionDto> Questions { get; set; } = new();
}

// ──────────────── Attempt ────────────────

public class SubmitAttemptInput
{
    public Guid AssessmentId { get; set; }
    public string? StartedAt { get; set; }
    public int DurationSeconds { get; set; }
    public Dictionary<string, int> Answers { get; set; } = new();
}

public class GradedQuestionDto
{
    public Guid Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int CorrectOptionIndex { get; set; }
    public string? Explanation { get; set; }
    public string? CompetencyCode { get; set; }
    public int SelectedOptionIndex { get; set; }
    public bool IsCorrect { get; set; }
}

public class AttemptResultDto
{
    public AttemptSummary Attempt { get; set; } = new();
    public bool Passed { get; set; }
    public decimal Score { get; set; }
    public decimal PassPercentage { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public CertificateInfoDto? Certificate { get; set; }
    public List<GradedQuestionDto> Questions { get; set; } = new();
}

public class AttemptSummary
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public bool Passed { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public int DurationSeconds { get; set; }
}

public class CertificateInfoDto
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
}

// ──────────────── Assessment History ────────────────

public class GetAssessmentHistoryInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public Guid? EmployeeId { get; set; }
    public Guid? CourseId { get; set; }
    public bool? Passed { get; set; }
    public string? Search { get; set; }
}

public class AssessmentAttemptRowDto
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public bool Passed { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public int DurationSeconds { get; set; }
}

public class GetAssessmentHistoryOutput : PagedList<AssessmentAttemptRowDto> { }
