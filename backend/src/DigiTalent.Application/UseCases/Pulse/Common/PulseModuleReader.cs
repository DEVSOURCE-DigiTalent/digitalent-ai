using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Một trang nội dung (slide) của mô đun = một bài học ACTIVE.</summary>
public sealed record PulseSlideInfo(Guid LessonId, string Title, string LessonType, string? ContentBody, int? EstimatedMinutes);

/// <summary>Mô đun ACTIVE của khóa, kèm các trang và bài ôn tập (QUIZ có module_id, bản PUBLISHED mới nhất).</summary>
public sealed class PulseModuleInfo
{
    public Guid ModuleId { get; init; }
    public Guid CourseId { get; init; }
    public int Index { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? EstimatedMinutes { get; init; }
    public IReadOnlyList<PulseSlideInfo> Slides { get; init; } = Array.Empty<PulseSlideInfo>();
    public Guid? QuizAssessmentId { get; init; }
    public int QuizQuestionCount { get; init; }
}

/// <summary>Tiến độ của một lượt học ở một mô đun.</summary>
public sealed record PulseModuleProgress(bool Viewed, bool QuizPassed)
{
    /// <summary>Mô đun có bài ôn tập: đạt bài ôn tập (đã đọc hết trang mới được làm). Không có bài ôn tập: đọc hết trang.</summary>
    public bool Passed(PulseModuleInfo module) => module.QuizAssessmentId.HasValue ? QuizPassed : Viewed;
}

/// <summary>
/// Đọc cấu trúc mô đun (§9) và tiến độ theo lượt học: mô đun ACTIVE theo sort_order, trang = bài học ACTIVE,
/// bài ôn tập = assessments (QUIZ, module_id) PUBLISHED bản mới nhất.
/// </summary>
public class PulseModuleReader
{
    private readonly IApplicationDbContext _context;

    public PulseModuleReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<Guid, List<PulseModuleInfo>>> LoadModulesAsync(IReadOnlyCollection<Guid> courseIds, bool includeContent)
    {
        if (courseIds.Count == 0)
        {
            return new Dictionary<Guid, List<PulseModuleInfo>>();
        }

        var modules = await _context.CourseModules
            .AsNoTracking()
            .Where(m => courseIds.Contains(m.CourseId) && m.Status == Statuses.CourseContent.Active)
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Title)
            .Select(m => new { m.Id, m.CourseId, m.Title, m.Description, m.EstimatedMinutes })
            .ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();

        var lessons = await _context.Lessons
            .AsNoTracking()
            .Where(l => moduleIds.Contains(l.ModuleId) && l.Status == Statuses.CourseContent.Active)
            .OrderBy(l => l.SortOrder).ThenBy(l => l.Title)
            .Select(l => new
            {
                l.Id,
                l.ModuleId,
                l.Title,
                l.LessonType,
                ContentBody = includeContent ? l.ContentBody : null,
                l.EstimatedMinutes,
            })
            .ToListAsync();
        var slidesByModule = lessons
            .GroupBy(l => l.ModuleId)
            .ToDictionary(g => g.Key, g => g.Select(l => new PulseSlideInfo(l.Id, l.Title, l.LessonType, l.ContentBody, l.EstimatedMinutes)).ToList());

        var quizzes = await _context.Assessments
            .AsNoTracking()
            .Where(a => a.ModuleId != null && moduleIds.Contains(a.ModuleId.Value)
                        && a.AssessmentType == Statuses.AssessmentType.Quiz
                        && a.Status == Statuses.Assessment.Published)
            .Select(a => new
            {
                a.Id,
                ModuleId = a.ModuleId!.Value,
                a.VersionNo,
                QuestionCount = _context.AssessmentQuestions.Count(q => q.AssessmentId == a.Id),
            })
            .ToListAsync();
        var quizByModule = quizzes
            .GroupBy(q => q.ModuleId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(q => q.VersionNo).First());

        return modules
            .GroupBy(m => m.CourseId)
            .ToDictionary(g => g.Key, g => g.Select((m, index) =>
            {
                var quiz = quizByModule.GetValueOrDefault(m.Id);
                return new PulseModuleInfo
                {
                    ModuleId = m.Id,
                    CourseId = m.CourseId,
                    Index = index,
                    Title = m.Title,
                    Description = m.Description,
                    EstimatedMinutes = m.EstimatedMinutes,
                    Slides = slidesByModule.GetValueOrDefault(m.Id) ?? new List<PulseSlideInfo>(),
                    QuizAssessmentId = quiz?.Id,
                    QuizQuestionCount = quiz?.QuestionCount ?? 0,
                };
            }).ToList());
    }

    /// <summary>
    /// Tiến độ mô đun theo lượt học. Lượt học COMPLETED (đã được duyệt, kể cả dữ liệu cũ không có bài ôn tập)
    /// được coi như đã qua mọi mô đun.
    /// </summary>
    public async Task<Dictionary<Guid, Dictionary<Guid, PulseModuleProgress>>> LoadProgressAsync(
        IReadOnlyCollection<(Guid EnrollmentId, string EnrollmentStatus, Guid CourseId)> enrollments,
        IReadOnlyDictionary<Guid, List<PulseModuleInfo>> modulesByCourse)
    {
        var result = new Dictionary<Guid, Dictionary<Guid, PulseModuleProgress>>();
        if (enrollments.Count == 0)
        {
            return result;
        }

        var enrollmentIds = enrollments.Select(e => e.EnrollmentId).ToList();
        var completedLessons = await _context.LessonProgresses
            .AsNoTracking()
            .Where(p => enrollmentIds.Contains(p.EnrollmentId) && p.Status == Statuses.LessonProgress.Completed)
            .Select(p => new { p.EnrollmentId, p.LessonId })
            .ToListAsync();
        var lessonsByEnrollment = completedLessons
            .GroupBy(p => p.EnrollmentId)
            .ToDictionary(g => g.Key, g => g.Select(p => p.LessonId).ToHashSet());

        var passedAttempts = await _context.AssessmentAttempts
            .AsNoTracking()
            .Where(a => enrollmentIds.Contains(a.EnrollmentId) && a.Passed == true)
            .Select(a => new { a.EnrollmentId, a.AssessmentId })
            .ToListAsync();
        var passedByEnrollment = passedAttempts
            .GroupBy(a => a.EnrollmentId)
            .ToDictionary(g => g.Key, g => g.Select(a => a.AssessmentId).ToHashSet());

        foreach (var (enrollmentId, status, courseId) in enrollments)
        {
            var completedAll = status == Statuses.Enrollment.Completed;
            var lessonIds = lessonsByEnrollment.GetValueOrDefault(enrollmentId) ?? new HashSet<Guid>();
            var quizIds = passedByEnrollment.GetValueOrDefault(enrollmentId) ?? new HashSet<Guid>();
            result[enrollmentId] = (modulesByCourse.GetValueOrDefault(courseId) ?? new List<PulseModuleInfo>())
                .ToDictionary(m => m.ModuleId, m => completedAll
                    ? new PulseModuleProgress(true, true)
                    : new PulseModuleProgress(
                        m.Slides.Count > 0 && m.Slides.All(s => lessonIds.Contains(s.LessonId)),
                        m.QuizAssessmentId is { } quizId && quizIds.Contains(quizId)));
        }

        return result;
    }

    public static int CountPassed(IReadOnlyList<PulseModuleInfo> modules, IReadOnlyDictionary<Guid, PulseModuleProgress>? progress) =>
        progress == null ? 0 : modules.Count(m => progress.TryGetValue(m.ModuleId, out var p) && p.Passed(m));
}
