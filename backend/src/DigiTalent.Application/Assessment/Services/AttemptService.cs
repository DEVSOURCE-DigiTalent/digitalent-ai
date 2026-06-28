using DigiTalent.Application.Assessment.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Certificate.Services;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Assessment.Services;

public class AttemptService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CertificateService _certificateService;

    public AttemptService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        CertificateService certificateService)
    {
        _context = context;
        _currentUser = currentUser;
        _certificateService = certificateService;
    }

    // ═══════════════════════════════════════
    // Start Attempt
    // ═══════════════════════════════════════

    public async Task<StartAttemptResponse> StartAttemptAsync(Guid assessmentId, Guid enrollmentId)
    {
        var assessment = await _context.Assessments
            .Include(a => a.AssessmentQuestions)
                .ThenInclude(aq => aq.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == assessmentId)
            ?? throw new KeyNotFoundException("Assessment not found.");

        if (assessment.Status != "PUBLISHED")
            throw new InvalidOperationException("Assessment is not published.");

        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        // Resolve employee ID from current user
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == _currentUser.UserId.Value)
            ?? throw new KeyNotFoundException("Employee profile not found for current user.");
        var employeeId = employee.Id;

        // Check max attempts
        if (assessment.MaxAttempts.HasValue)
        {
            var previousAttempts = await _context.AssessmentAttempts
                .CountAsync(a => a.AssessmentId == assessmentId
                              && a.EmployeeId == employeeId
                              && (a.Status == "SUBMITTED" || a.Status == "GRADED"));

            if (previousAttempts >= assessment.MaxAttempts.Value)
                throw new InvalidOperationException(
                    $"Maximum attempts ({assessment.MaxAttempts.Value}) reached for this assessment.");
        }

        // Auto-increment AttemptNo
        var attemptNo = await _context.AssessmentAttempts
            .CountAsync(a => a.AssessmentId == assessmentId && a.EmployeeId == employeeId) + 1;

        var attempt = new Domain.Entities.Assessment.AssessmentAttempt
        {
            AssessmentId = assessmentId,
            EnrollmentId = enrollmentId,
            EmployeeId = employeeId,
            AttemptNo = attemptNo,
            Status = "IN_PROGRESS",
            StartedAt = DateTimeOffset.UtcNow,
        };
        _context.AssessmentAttempts.Add(attempt);
        await _context.SaveChangesAsync(default);

        return new StartAttemptResponse
        {
            AttemptId = attempt.Id,
            AttemptNo = attempt.AttemptNo,
            StartedAt = attempt.StartedAt,
            Questions = assessment.AssessmentQuestions
                .OrderBy(aq => aq.SortOrder)
                .Select(aq => new AttemptQuestionResponse
                {
                    QuestionId = aq.QuestionId,
                    Content = aq.Question.Content,
                    QuestionType = aq.Question.QuestionType,
                    Difficulty = aq.Question.Difficulty,
                    ScoreWeight = aq.ScoreWeight,
                    Options = aq.Question.Options
                        .OrderBy(o => o.SortOrder)
                        .Select(o => new AttemptOptionResponse
                        {
                            Id = o.Id,
                            Content = o.Content,
                            SortOrder = o.SortOrder,
                        })
                        .ToList(),
                })
                .ToList(),
        };
    }

    // ═══════════════════════════════════════
    // Submit Attempt
    // ═══════════════════════════════════════

    public async Task<SubmitAttemptResponse> SubmitAttemptAsync(Guid attemptId, SubmitAttemptRequest request)
    {
        var attempt = await _context.AssessmentAttempts
            .Include(a => a.Assessment)
                .ThenInclude(a => a.AssessmentQuestions)
                    .ThenInclude(aq => aq.Question)
                        .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == attemptId)
            ?? throw new KeyNotFoundException("Attempt not found.");

        if (attempt.Status != "IN_PROGRESS")
            throw new InvalidOperationException("Attempt is not in progress.");

        // Build question lookup
        var questions = attempt.Assessment.AssessmentQuestions
            .ToDictionary(aq => aq.QuestionId);

        decimal totalScore = 0;
        decimal maxScore = questions.Values.Sum(q => q.ScoreWeight);

        foreach (var answerReq in request.Answers)
        {
            if (!questions.TryGetValue(answerReq.QuestionId, out var aq))
                continue;

            var question = aq.Question;
            decimal? scoreAwarded = null;
            bool? isCorrect = null;

            if (question.QuestionType == "SINGLE_CHOICE" && answerReq.SelectedOptionId.HasValue)
            {
                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                isCorrect = correctOption != null && answerReq.SelectedOptionId.Value == correctOption.Id;
                scoreAwarded = isCorrect.Value ? aq.ScoreWeight : 0;
            }
            else if (question.QuestionType == "MULTIPLE_CHOICE" && answerReq.SelectedOptionId.HasValue)
            {
                // All-or-nothing: all correct options must be selected
                var correctOptions = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedCorrect = correctOptions.Contains(answerReq.SelectedOptionId.Value);
                isCorrect = selectedCorrect;
                scoreAwarded = selectedCorrect ? aq.ScoreWeight : 0;
            }
            // ESSAY: leave scoreAwarded = null, awaiting manual grading

            _context.AssessmentAnswers.Add(new Domain.Entities.Assessment.AssessmentAnswer
            {
                AttemptId = attemptId,
                QuestionId = answerReq.QuestionId,
                SelectedOptionId = answerReq.SelectedOptionId,
                AnswerText = answerReq.AnswerText,
                IsCorrect = isCorrect,
                ScoreAwarded = scoreAwarded,
            });

            if (scoreAwarded.HasValue)
                totalScore += scoreAwarded.Value;
        }

        // Calculate final score as percentage
        var scorePercentage = maxScore > 0
            ? Math.Round((totalScore / maxScore) * 100, 2)
            : 0;

        attempt.Score = scorePercentage;
        attempt.Passed = scorePercentage >= attempt.Assessment.PassingScore;
        attempt.Status = "SUBMITTED";
        attempt.SubmittedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(default);

        // Auto-certificate: if passed AND enrollment completed
        if (attempt.Passed == true)
        {
            await TryAutoIssueCertificateAsync(attempt);
        }

        return new SubmitAttemptResponse
        {
            AttemptId = attempt.Id,
            Status = attempt.Status,
            Score = attempt.Score,
            Passed = attempt.Passed,
            SubmittedAt = attempt.SubmittedAt,
            Message = attempt.Passed == true
                ? "Congratulations! You passed the assessment."
                : "You did not pass. Please review and try again.",
        };
    }

    // ═══════════════════════════════════════
    // Get Attempt Result
    // ═══════════════════════════════════════

    public async Task<AttemptDetailResponse> GetAttemptResultAsync(Guid attemptId)
    {
        var attempt = await _context.AssessmentAttempts
            .Include(a => a.Assessment)
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == attemptId)
            ?? throw new KeyNotFoundException("Attempt not found.");

        return new AttemptDetailResponse
        {
            Id = attempt.Id,
            AssessmentId = attempt.AssessmentId,
            EnrollmentId = attempt.EnrollmentId,
            EmployeeId = attempt.EmployeeId,
            AttemptNo = attempt.AttemptNo,
            Status = attempt.Status,
            StartedAt = attempt.StartedAt,
            SubmittedAt = attempt.SubmittedAt,
            Score = attempt.Score,
            Passed = attempt.Passed,
            AssessmentTitle = attempt.Assessment.Title,
            Answers = attempt.Answers.Select(ans =>
            {
                var aq = attempt.Assessment.AssessmentQuestions
                    .FirstOrDefault(aq => aq.QuestionId == ans.QuestionId);

                return new AnswerDetailResponse
                {
                    QuestionId = ans.QuestionId,
                    QuestionContent = ans.Question.Content,
                    QuestionType = ans.Question.QuestionType,
                    SelectedOptionContent = ans.SelectedOptionId.HasValue
                        ? ans.Question.Options
                            .Where(o => o.Id == ans.SelectedOptionId.Value)
                            .Select(o => o.Content)
                            .FirstOrDefault()
                        : null,
                    AnswerText = ans.AnswerText,
                    IsCorrect = ans.IsCorrect,
                    ScoreAwarded = ans.ScoreAwarded,
                    ScoreWeight = aq?.ScoreWeight ?? 0,
                    CorrectOptionContent = ans.Question.QuestionType != "ESSAY"
                        ? ans.Question.Options
                            .Where(o => o.IsCorrect)
                            .Select(o => o.Content)
                            .FirstOrDefault()
                        : null,
                    Explanation = ans.Question.Explanation,
                };
            }).ToList(),
        };
    }

    // ═══════════════════════════════════════
    // Regrade / Override
    // ═══════════════════════════════════════

    public async Task<AttemptDetailResponse> RegradeAttemptAsync(Guid attemptId, RegradeAttemptRequest request)
    {
        var attempt = await _context.AssessmentAttempts
            .Include(a => a.Assessment)
            .Include(a => a.Answers)
                .ThenInclude(ans => ans.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == attemptId)
            ?? throw new KeyNotFoundException("Attempt not found.");

        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        foreach (var regradeReq in request.Answers)
        {
            var answer = attempt.Answers.FirstOrDefault(a => a.QuestionId == regradeReq.QuestionId);
            if (answer == null) continue;

            if (regradeReq.ScoreAwarded.HasValue)
                answer.ScoreAwarded = regradeReq.ScoreAwarded;
            if (regradeReq.IsCorrect.HasValue)
                answer.IsCorrect = regradeReq.IsCorrect;

            answer.GradedByUserId = _currentUser.UserId;
        }

        // Recalculate total score
        var maxScore = attempt.Assessment.AssessmentQuestions.Sum(aq => aq.ScoreWeight);
        var totalScore = attempt.Answers.Sum(a => a.ScoreAwarded ?? 0);
        var scorePercentage = maxScore > 0
            ? Math.Round((totalScore / maxScore) * 100, 2)
            : 0;

        attempt.Score = scorePercentage;
        attempt.Passed = scorePercentage >= attempt.Assessment.PassingScore;
        attempt.Status = "GRADED";

        await _context.SaveChangesAsync(default);

        // Auto-certificate if newly passed
        if (attempt.Passed == true)
        {
            await TryAutoIssueCertificateAsync(attempt);
        }

        return await GetAttemptResultAsync(attemptId);
    }

    // ═══════════════════════════════════════
    // Private: Auto-certificate
    // ═══════════════════════════════════════

    private async Task TryAutoIssueCertificateAsync(Domain.Entities.Assessment.AssessmentAttempt attempt)
    {
        // Check if enrollment is completed
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.Id == attempt.EnrollmentId);

        if (enrollment == null || enrollment.Status != "COMPLETED")
            return;

        // Check if certificate already exists
        var existingCert = await _context.Certificates
            .AnyAsync(c => c.AssessmentAttemptId == attempt.Id);
        if (existingCert)
            return;

        // Find an active template
        var template = await _context.CertificateTemplates
            .Where(t => t.Status == "ACTIVE")
            .FirstOrDefaultAsync();

        if (template == null)
            return;

        // Auto-issue certificate
        await _certificateService.IssueCertificateAsync(
            new Certificate.DTOs.IssueCertificateRequest
            {
                EmployeeId = attempt.EmployeeId,
                CourseId = attempt.Assessment.CourseId,
                AssessmentAttemptId = attempt.Id,
                CertificateTemplateId = template.Id,
            });
    }
}
