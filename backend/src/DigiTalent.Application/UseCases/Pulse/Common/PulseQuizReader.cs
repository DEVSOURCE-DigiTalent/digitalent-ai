using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

public sealed record PulseQuizOption(Guid OptionId, string Content, bool IsCorrect);

public sealed record PulseQuizQuestion(Guid QuestionId, string Content, string? Explanation, IReadOnlyList<PulseQuizOption> Options);

/// <summary>Nội dung trang và câu hỏi ôn tập của một mô đun (đọc riêng để không tải nội dung cả danh mục).</summary>
public class PulseQuizReader
{
    private readonly IApplicationDbContext _context;

    public PulseQuizReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<Guid, string?>> LoadSlideContentAsync(IReadOnlyCollection<Guid> lessonIds) =>
        await _context.Lessons
            .AsNoTracking()
            .Where(l => lessonIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l.ContentBody);

    public async Task<List<PulseQuizQuestion>> LoadQuestionsAsync(Guid assessmentId)
    {
        var questions = await (
                from link in _context.AssessmentQuestions.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                where link.AssessmentId == assessmentId
                orderby link.SortOrder
                select new { question.Id, question.Content, question.Explanation })
            .ToListAsync();
        var ids = questions.Select(q => q.Id).ToList();
        var options = await _context.QuestionOptions
            .AsNoTracking()
            .Where(o => ids.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder)
            .Select(o => new { o.Id, o.QuestionId, o.Content, o.IsCorrect })
            .ToListAsync();

        return questions
            .Select(q => new PulseQuizQuestion(
                q.Id,
                q.Content,
                q.Explanation,
                options.Where(o => o.QuestionId == q.Id).Select(o => new PulseQuizOption(o.Id, o.Content, o.IsCorrect)).ToList()))
            .ToList();
    }

    public async Task<PulseQuizResultDto?> LastResultAsync(Guid enrollmentId, Guid assessmentId)
    {
        var attempt = await _context.AssessmentAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollmentId && a.AssessmentId == assessmentId && a.ScoredAt != null)
            .OrderByDescending(a => a.AttemptNo)
            .Select(a => new { a.Id, a.Passed, a.ScoredAt })
            .FirstOrDefaultAsync();
        if (attempt == null)
        {
            return null;
        }

        var answers = await _context.AssessmentAnswers
            .AsNoTracking()
            .Where(a => a.AttemptId == attempt.Id)
            .Select(a => a.IsCorrect)
            .ToListAsync();
        return new PulseQuizResultDto
        {
            Score = answers.Count(c => c == true),
            Total = answers.Count,
            Passed = attempt.Passed == true,
            At = attempt.ScoredAt!.Value,
        };
    }
}
