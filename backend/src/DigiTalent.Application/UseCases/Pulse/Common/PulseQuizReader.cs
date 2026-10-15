using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

public sealed record PulseQuizOption(Guid OptionId, string Content, bool IsCorrect);

public sealed record PulseQuizQuestion(Guid QuestionId, string Content, string? Explanation, int SortOrder, IReadOnlyList<PulseQuizOption> Options);

/// <summary>
/// Nội dung trang và câu hỏi ôn tập của một mô đun (đọc riêng để không tải nội dung cả danh mục).
/// Mỗi lần làm rút <see cref="PulseRules.ModuleQuizDrawSize"/> câu từ ngân hàng của mô đun, lần sau rút câu khác,
/// thứ tự phương án trộn theo lần làm. Lần chưa đạt phải mở lại trang của câu chưa đúng rồi mới làm tiếp (§9.2).
/// </summary>
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

    /// <summary>Cả ngân hàng câu hỏi của bài ôn tập, theo sort_order (câu 2k-1, 2k ↔ trang k).</summary>
    public async Task<List<PulseQuizQuestion>> LoadQuestionsAsync(Guid assessmentId)
    {
        var questions = await (
                from link in _context.AssessmentQuestions.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                where link.AssessmentId == assessmentId
                orderby link.SortOrder
                select new { question.Id, question.Content, question.Explanation, link.SortOrder })
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
                q.SortOrder,
                options.Where(o => o.QuestionId == q.Id).Select(o => new PulseQuizOption(o.Id, o.Content, o.IsCorrect)).ToList()))
            .ToList();
    }

    /// <summary>
    /// Bộ câu của lần làm thứ <paramref name="attemptNo"/>: ngân hàng được xếp ngẫu nhiên một lần cho mỗi nhân viên và
    /// bài ôn tập, rồi mỗi lần làm lấy nhóm câu kế tiếp (ngân hàng 6 câu: lần 1, 2, 3 không trùng câu nào). Phương án được
    /// trộn theo lần làm. Cùng đầu vào luôn cho cùng kết quả, nên trang học và lúc chấm thấy đúng một bộ câu.
    /// </summary>
    public static IReadOnlyList<PulseQuizQuestion> Draw(IReadOnlyList<PulseQuizQuestion> pool, Guid employeeId, Guid assessmentId, int attemptNo)
    {
        if (pool.Count == 0)
        {
            return pool;
        }

        var order = Shuffle(pool.OrderBy(q => q.SortOrder).ThenBy(q => q.QuestionId).ToList(), new Random(Seed(employeeId, assessmentId, 0)));
        var size = Math.Min(PulseRules.ModuleQuizDrawSize, order.Count);
        var start = (Math.Max(attemptNo, 1) - 1) * size;
        var optionRandom = new Random(Seed(employeeId, assessmentId, attemptNo));
        return Enumerable.Range(0, size)
            .Select(i => order[(start + i) % order.Count])
            .Select(q => q with { Options = Shuffle(q.Options.ToList(), optionRandom) })
            .ToList();
    }

    /// <summary>Số thứ tự của lần làm kế tiếp (1 khi chưa có lượt học hoặc chưa làm lần nào).</summary>
    public async Task<int> NextAttemptNoAsync(Guid assessmentId, Guid? enrollmentId) =>
        enrollmentId is { } id
            ? (await _context.AssessmentAttempts
                .Where(a => a.AssessmentId == assessmentId && a.EnrollmentId == id)
                .MaxAsync(a => (int?)a.AttemptNo) ?? 0) + 1
            : 1;

    /// <summary>
    /// Việc phải làm trước lần làm tiếp theo: lần gần nhất chưa đạt (và mô đun chưa từng đạt) thì mở lại trang của các câu
    /// chưa đúng; trang tính là đã xem lại khi được mở sau thời điểm nộp lần đó. null = không cần xem lại.
    /// </summary>
    public async Task<PulseQuizReviewDto?> ReviewAsync(Guid enrollmentId, PulseModuleInfo module, IReadOnlyList<PulseQuizQuestion> pool)
    {
        if (module.QuizAssessmentId is not { } assessmentId)
        {
            return null;
        }

        var attempts = await _context.AssessmentAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollmentId && a.AssessmentId == assessmentId && a.ScoredAt != null)
            .Select(a => new { a.Id, a.AttemptNo, a.Passed, a.SubmittedAt, a.ScoredAt })
            .ToListAsync();
        var last = attempts.MaxBy(a => a.AttemptNo);
        if (last == null || attempts.Any(a => a.Passed == true))
        {
            return null;
        }

        var wrong = await _context.AssessmentAnswers
            .AsNoTracking()
            .Where(a => a.AttemptId == last.Id && a.IsCorrect != true)
            .Select(a => a.QuestionId)
            .ToListAsync();
        var failedAt = last.SubmittedAt ?? last.ScoredAt!.Value;
        var pages = ReviewPages(module, pool, wrong);
        var lessonIds = pages.Select(p => p.LessonId).ToList();
        var reviewed = await _context.LessonProgresses
            .AsNoTracking()
            .Where(p => p.EnrollmentId == enrollmentId && lessonIds.Contains(p.LessonId) && p.LastAccessedAt > failedAt)
            .Select(p => p.LessonId)
            .ToListAsync();
        foreach (var page in pages)
        {
            page.Done = reviewed.Contains(page.LessonId);
        }

        return new PulseQuizReviewDto { AttemptNo = last.AttemptNo, FailedAt = failedAt, Pages = pages, Done = pages.All(p => p.Done) };
    }

    /// <summary>Các trang (không trùng, theo thứ tự) gắn với các câu chưa đúng.</summary>
    public static List<PulseQuizReviewPageDto> ReviewPages(PulseModuleInfo module, IReadOnlyList<PulseQuizQuestion> pool, IEnumerable<Guid> wrongQuestionIds)
    {
        var sortOrders = pool.ToDictionary(q => q.QuestionId, q => q.SortOrder);
        return wrongQuestionIds
            .Select(id => PulseRules.QuizPageIndex(sortOrders.GetValueOrDefault(id, 1), module.Slides.Count))
            .Where(index => index >= 0)
            .Distinct()
            .Order()
            .Select(index => new PulseQuizReviewPageDto { LessonId = module.Slides[index].LessonId, Index = index, Title = module.Slides[index].Title })
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

    /// <summary>Hạt giống ổn định giữa các lần chạy (không dùng string.GetHashCode, vốn đổi theo tiến trình).</summary>
    private static int Seed(Guid a, Guid b, int salt)
    {
        var x = a.ToByteArray();
        var y = b.ToByteArray();
        unchecked
        {
            var hash = 17;
            for (var i = 0; i < 16; i++)
            {
                hash = hash * 31 + (x[i] ^ (y[i] << 1));
            }

            return hash * 31 + salt;
        }
    }

    private static List<T> Shuffle<T>(List<T> items, Random random)
    {
        for (var i = items.Count - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (items[i], items[j]) = (items[j], items[i]);
        }

        return items;
    }
}
