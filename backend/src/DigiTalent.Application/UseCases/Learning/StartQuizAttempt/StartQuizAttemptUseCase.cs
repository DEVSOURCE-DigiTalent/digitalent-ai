using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class StartQuizAttemptUseCase : IUseCase<StartQuizAttemptUseCaseInput, StartQuizAttemptUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public StartQuizAttemptUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<StartQuizAttemptUseCaseOutput> ExecuteAsync(StartQuizAttemptUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");

        var assessment = await _context.Assessments
            .AsNoTracking()
            .Where(a => a.Id == input.AssessmentId && a.Status == "PUBLISHED")
            .Select(a => new { a.Id, a.CourseId, a.TimeLimitMinutes, a.MaxAttempts })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Published assessment '{input.AssessmentId}' not found.");

        var enrollment = await _context.Enrollments
            .Where(e => e.EmployeeId == employeeId && e.CourseId == assessment.CourseId)
            .Select(e => new { e.Id })
            .FirstOrDefaultAsync()
            ?? throw new BadRequestException("Not enrolled in this course.", "AssessmentId", "NOT_ENROLLED");

        var lastAttemptNo = await _context.AssessmentAttempts
            .Where(a => a.AssessmentId == input.AssessmentId && a.EnrollmentId == enrollment.Id)
            .MaxAsync(a => (int?)a.AttemptNo) ?? 0;

        if (assessment.MaxAttempts.HasValue && lastAttemptNo >= assessment.MaxAttempts.Value)
            throw new BadRequestException("Maximum attempts reached.", "AssessmentId", "MAX_ATTEMPTS_REACHED");

        var attempt = new AssessmentAttempt
        {
            AssessmentId = input.AssessmentId,
            EnrollmentId = enrollment.Id,
            AttemptNo = lastAttemptNo + 1,
            Status = "STARTED",
            StartedAt = DateTimeOffset.UtcNow
        };
        _context.AssessmentAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        var questions = await _context.AssessmentQuestions
            .AsNoTracking()
            .Where(aq => aq.AssessmentId == input.AssessmentId)
            .Join(_context.Questions, aq => aq.QuestionId, q => q.Id, (aq, q) => new { aq, q })
            .OrderBy(x => x.aq.SortOrder)
            .Select(x => new QuizQuestionDto
            {
                QuestionId = x.q.Id,
                Content = x.q.Content,
                QuestionType = x.q.QuestionType,
                SortOrder = x.aq.SortOrder,
                Points = x.aq.Points,
                Options = _context.QuestionOptions
                    .Where(o => o.QuestionId == x.q.Id)
                    .OrderBy(o => o.SortOrder)
                    .Select(o => new QuizOptionDto
                    {
                        OptionId = o.Id,
                        Content = o.Content,
                        SortOrder = o.SortOrder
                    }).ToList()
            })
            .ToListAsync();

        return new StartQuizAttemptUseCaseOutput
        {
            AttemptId = attempt.Id,
            AttemptNo = attempt.AttemptNo,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            Questions = questions
        };
    }
}
