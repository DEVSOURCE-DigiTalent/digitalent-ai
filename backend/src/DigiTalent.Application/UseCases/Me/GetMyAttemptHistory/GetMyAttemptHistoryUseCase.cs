using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-13 — Lịch sử đánh giá: các lần làm bài của CHÍNH mình (không bao giờ thấy của người khác).</summary>
public class GetMyAttemptHistoryUseCase : IUseCase<GetMyAttemptHistoryUseCaseInput, GetMyAttemptHistoryUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;

    public GetMyAttemptHistoryUseCase(IApplicationDbContext context, MyEmployeeContext me)
    {
        _context = context;
        _me = me;
    }

    public async Task<GetMyAttemptHistoryUseCaseOutput> ExecuteAsync(GetMyAttemptHistoryUseCaseInput input)
    {
        var employee = await _me.GetAsync();

        var query =
            from attempt in _context.AssessmentAttempts.AsNoTracking()
            join enrollment in _context.Enrollments.AsNoTracking() on attempt.EnrollmentId equals enrollment.Id
            join assessment in _context.Assessments.AsNoTracking() on attempt.AssessmentId equals assessment.Id
            join course in _context.Courses.AsNoTracking() on assessment.CourseId equals course.Id
            where enrollment.EmployeeId == employee.Id
            select new { attempt, assessment, course };

        if (input.AssessmentId.HasValue)
        {
            query = query.Where(x => x.assessment.Id == input.AssessmentId.Value);
        }

        if (input.Passed.HasValue)
        {
            query = query.Where(x => x.attempt.Passed == input.Passed.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            query = query.Where(x => x.assessment.Title.ToLower().Contains(keyword)
                                     || x.course.Title.ToLower().Contains(keyword)
                                     || x.course.Code.ToLower().Contains(keyword));
        }

        var totalItems = await query.CountAsync();
        var rows = await query
            .OrderByDescending(x => x.attempt.SubmittedAt ?? x.attempt.StartedAt)
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(x => new
            {
                x.attempt,
                x.assessment,
                x.course,
                CorrectCount = _context.AssessmentAnswers.Count(a => a.AttemptId == x.attempt.Id && a.IsCorrect == true),
                TotalQuestions = _context.AssessmentQuestions.Count(q => q.AssessmentId == x.assessment.Id),
            })
            .ToListAsync();

        return new GetMyAttemptHistoryUseCaseOutput
        {
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = totalItems,
            Items = rows.Select(r => new MyAttemptHistoryRowDto
            {
                AttemptId = r.attempt.Id,
                AssessmentId = r.assessment.Id,
                AssessmentTitle = r.assessment.Title,
                AssessmentType = r.assessment.AssessmentType,
                IsFinal = r.assessment.IsFinal,
                CourseId = r.course.Id,
                CourseCode = r.course.Code,
                CourseTitle = r.course.Title,
                AttemptNo = r.attempt.AttemptNo,
                Status = r.attempt.Status,
                StartedAt = r.attempt.StartedAt,
                SubmittedAt = r.attempt.SubmittedAt,
                DurationSeconds = r.attempt.SubmittedAt.HasValue
                    ? Math.Max(0, (int)(r.attempt.SubmittedAt.Value - r.attempt.StartedAt).TotalSeconds)
                    : 0,
                Score = r.attempt.Score,
                PassingScore = r.assessment.PassingScore,
                Passed = r.attempt.Passed,
                CorrectCount = r.CorrectCount,
                TotalQuestions = r.TotalQuestions,
            }).ToList(),
        };
    }
}
