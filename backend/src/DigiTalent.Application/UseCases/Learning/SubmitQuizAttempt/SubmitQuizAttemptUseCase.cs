using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class SubmitQuizAttemptUseCase : IUseCase<SubmitQuizAttemptUseCaseInput, SubmitQuizAttemptUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public SubmitQuizAttemptUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<SubmitQuizAttemptUseCaseOutput> ExecuteAsync(SubmitQuizAttemptUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");

        var attempt = await _context.AssessmentAttempts
            .FirstOrDefaultAsync(a => a.Id == input.AttemptId)
            ?? throw new NotFoundException($"Attempt '{input.AttemptId}' not found.");

        if (attempt.Status != "STARTED")
            throw new BadRequestException("Attempt already submitted.", "AttemptId", "ALREADY_SUBMITTED");

        var enrollment = await _context.Enrollments
            .Where(e => e.Id == attempt.EnrollmentId && e.EmployeeId == employeeId)
            .FirstOrDefaultAsync()
            ?? throw new ForbiddenException("This attempt does not belong to you.");

        var assessment = await _context.Assessments
            .AsNoTracking()
            .Where(a => a.Id == attempt.AssessmentId)
            .Select(a => new { a.PassingScore, a.IsFinal, a.CourseId })
            .FirstAsync();

        var assessmentQuestions = await _context.AssessmentQuestions
            .AsNoTracking()
            .Where(aq => aq.AssessmentId == attempt.AssessmentId)
            .ToListAsync();

        var questionIds = assessmentQuestions.Select(aq => aq.QuestionId).ToList();

        var correctOptions = await _context.QuestionOptions
            .AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId) && o.IsCorrect)
            .ToDictionaryAsync(o => o.QuestionId, o => o.Id);

        var pointsMap = assessmentQuestions.ToDictionary(aq => aq.QuestionId, aq => aq.Points);

        var now = DateTimeOffset.UtcNow;
        decimal totalPoints = assessmentQuestions.Sum(aq => aq.Points);
        decimal earnedPoints = 0;
        var results = new List<AnswerResultDto>();

        foreach (var aq in assessmentQuestions)
        {
            var submission = input.Answers.FirstOrDefault(a => a.QuestionId == aq.QuestionId);
            var correctOptionId = correctOptions.GetValueOrDefault(aq.QuestionId);
            var isCorrect = submission?.SelectedOptionId != null
                && submission.SelectedOptionId == correctOptionId;
            var awarded = isCorrect ? aq.Points : 0m;
            earnedPoints += awarded;

            var answer = new AssessmentAnswer
            {
                AttemptId = input.AttemptId,
                QuestionId = aq.QuestionId,
                SelectedOptionId = submission?.SelectedOptionId,
                IsCorrect = isCorrect,
                PointsAwarded = awarded
            };
            _context.AssessmentAnswers.Add(answer);

            results.Add(new AnswerResultDto
            {
                QuestionId = aq.QuestionId,
                IsCorrect = isCorrect,
                PointsAwarded = awarded,
                CorrectOptionId = correctOptionId
            });
        }

        var score = totalPoints > 0 ? Math.Round(earnedPoints / totalPoints * 100, 2) : 0;
        var passed = score >= assessment.PassingScore;

        attempt.Status = "SCORED";
        attempt.SubmittedAt = now;
        attempt.ScoredAt = now;
        attempt.Score = score;
        attempt.Passed = passed;

        await _context.SaveChangesAsync();

        return new SubmitQuizAttemptUseCaseOutput
        {
            AttemptId = attempt.Id,
            Score = score,
            PassingScore = assessment.PassingScore,
            Passed = passed,
            Results = results,
            CourseCompleted = false
        };
    }
}
