namespace DigiTalent.Application.Assessment.DTOs;

// ═══════════════════════════════════════════════
// Question Banks
// ═══════════════════════════════════════════════

public class CreateQuestionBankRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? OwnerTrainerId { get; set; }
}

public class UpdateQuestionBankRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
}

public class QuestionBankResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Questions
// ═══════════════════════════════════════════════

public class CreateQuestionOptionRequest
{
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class CreateQuestionRequest
{
    public Guid CompetencyId { get; set; }
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public List<CreateQuestionOptionRequest> Options { get; set; } = new();
}

public class UpdateQuestionRequest
{
    public string? Content { get; set; }
    public string? Explanation { get; set; }
    public string? Difficulty { get; set; }
    public string? Status { get; set; }
    public List<CreateQuestionOptionRequest>? Options { get; set; }
}

public class QuestionOptionResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class QuestionResponse
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
    public List<QuestionOptionResponse> Options { get; set; } = new();
}

public class QuestionDetailResponse : QuestionResponse
{
    // Kế thừa toàn bộ từ QuestionResponse, bao gồm cả Options với IsCorrect
}

// ═══════════════════════════════════════════════
// Assessments
// ═══════════════════════════════════════════════

public class CreateAssessmentRequest
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = "QUIZ";
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public decimal PassingScore { get; set; }
}

public class UpdateAssessmentRequest
{
    public string? Title { get; set; }
    public string? AssessmentType { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public decimal? PassingScore { get; set; }
}

public class AssessmentResponse
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public decimal PassingScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class AssessmentDetailResponse : AssessmentResponse
{
    public List<AssessmentQuestionResponse> Questions { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Assessment Questions (junction)
// ═══════════════════════════════════════════════

public class AddAssessmentQuestionRequest
{
    public Guid QuestionId { get; set; }
    public decimal ScoreWeight { get; set; }
    public int SortOrder { get; set; }
}

public class SaveAssessmentQuestionsRequest
{
    public List<AddAssessmentQuestionRequest> Questions { get; set; } = new();
}

public class AssessmentQuestionResponse
{
    public Guid AssessmentId { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionContent { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public decimal ScoreWeight { get; set; }
    public int SortOrder { get; set; }
}

// ═══════════════════════════════════════════════
// Assessment Attempts
// ═══════════════════════════════════════════════

public class StartAttemptResponse
{
    public Guid AttemptId { get; set; }
    public int AttemptNo { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public List<AttemptQuestionResponse> Questions { get; set; } = new();
}

public class AttemptQuestionResponse
{
    public Guid QuestionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? Difficulty { get; set; }
    public decimal ScoreWeight { get; set; }
    public List<AttemptOptionResponse> Options { get; set; } = new();
}

public class AttemptOptionResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class SubmitAnswerRequest
{
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
}

public class SubmitAttemptRequest
{
    public List<SubmitAnswerRequest> Answers { get; set; } = new();
}

public class SubmitAttemptResponse
{
    public Guid AttemptId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public bool? Passed { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public string? Message { get; set; }
}

public class AttemptResponse
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public Guid EnrollmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public int AttemptNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public decimal? Score { get; set; }
    public bool? Passed { get; set; }
}

public class AttemptDetailResponse : AttemptResponse
{
    public string AssessmentTitle { get; set; } = string.Empty;
    public List<AnswerDetailResponse> Answers { get; set; } = new();
}

public class AnswerDetailResponse
{
    public Guid QuestionId { get; set; }
    public string QuestionContent { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? SelectedOptionContent { get; set; }
    public string? AnswerText { get; set; }
    public bool? IsCorrect { get; set; }
    public decimal? ScoreAwarded { get; set; }
    public decimal ScoreWeight { get; set; }
    public string? CorrectOptionContent { get; set; }
    public string? Explanation { get; set; }
}

// ═══════════════════════════════════════════════
// Regrade / Override
// ═══════════════════════════════════════════════

public class RegradeAnswerRequest
{
    public Guid QuestionId { get; set; }
    public decimal? ScoreAwarded { get; set; }
    public bool? IsCorrect { get; set; }
}

public class RegradeAttemptRequest
{
    public List<RegradeAnswerRequest> Answers { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Approval
// ═══════════════════════════════════════════════

public class ApprovalRequest
{
    public string? Comment { get; set; }
}
