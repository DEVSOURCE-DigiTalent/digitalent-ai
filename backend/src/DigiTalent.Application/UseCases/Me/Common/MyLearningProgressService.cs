using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>1 bài học ACTIVE của khóa, đã sắp theo thứ tự học (module → bài).</summary>
public sealed record CourseLessonInfo(
    Guid LessonId,
    Guid ModuleId,
    string ModuleTitle,
    string? Code,
    string Title,
    string LessonType,
    int? EstimatedMinutes,
    bool IsRequired,
    string CompletionRule,
    bool CountsForProgress);

/// <summary>
/// Quy tắc tiến độ học (COURSE-08, COURSE-09, BR-07):
///   - Chỉ bài có completion_rule VIEW / MANUAL_COMPLETE là nhân viên tự đánh dấu hoàn thành được.
///     PASS_CHECK / SUBMIT_ACTIVITY hoàn thành qua quiz / nhiệm vụ, không tự đánh dấu.
///   - Tiến độ khóa = số bài bắt buộc tự hoàn thành được đã xong / tổng số bài đó.
///   - Học đủ → READY_FOR_ASSESSMENT; khóa không có bài thi cuối PUBLISHED → COMPLETED luôn.
///   - COMPLETED (đạt bài thi cuối) do luồng nộp bài đánh giá đặt, không do bài học.
/// </summary>
public class MyLearningProgressService
{
    private readonly IApplicationDbContext _context;

    public MyLearningProgressService(IApplicationDbContext context)
    {
        _context = context;
    }

    public const string NotEnrolledMessage = "Bạn cần ghi danh khóa học trước khi học bài này.";

    public static bool IsSelfCompletable(string completionRule) =>
        completionRule is Statuses.LessonCompletionRule.View or Statuses.LessonCompletionRule.ManualComplete;

    /// <summary>
    /// Bài học thuộc khóa (ACTIVE) + enrollment còn hiệu lực của nhân viên với khóa đó.
    /// <paramref name="trackEnrollment"/> = true khi caller sẽ cập nhật enrollment.
    /// </summary>
    public async Task<(Enrollment Enrollment, List<CourseLessonInfo> Lessons, CourseLessonInfo Lesson)> GetEnrolledLessonAsync(
        Employee employee, Guid courseId, Guid lessonId, bool trackEnrollment)
    {
        var courseExists = await _context.Courses.AsNoTracking()
            .AnyAsync(c => c.Id == courseId && c.OrganizationId == employee.OrganizationId);
        var lessons = courseExists ? await LoadLessonsAsync(courseId) : new List<CourseLessonInfo>();
        var lesson = lessons.FirstOrDefault(l => l.LessonId == lessonId)
            ?? throw new NotFoundException("Không tìm thấy bài học trong khóa này.");

        var enrollments = trackEnrollment ? _context.Enrollments : _context.Enrollments.AsNoTracking();
        var enrollment = await enrollments
            .Where(e => e.EmployeeId == employee.Id && e.CourseId == courseId && e.Status != Statuses.Enrollment.Cancelled)
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync()
            ?? throw new ForbiddenException(NotEnrolledMessage);

        return (enrollment, lessons, lesson);
    }

    public async Task<List<CourseLessonInfo>> LoadLessonsAsync(Guid courseId)
    {
        var rows = await (
                from lesson in _context.Lessons.AsNoTracking()
                join module in _context.CourseModules.AsNoTracking() on lesson.ModuleId equals module.Id
                where module.CourseId == courseId
                      && module.Status == Statuses.CourseContent.Active
                      && lesson.Status == Statuses.CourseContent.Active
                orderby module.SortOrder, lesson.SortOrder
                select new
                {
                    lesson.Id,
                    lesson.ModuleId,
                    ModuleTitle = module.Title,
                    ModuleRequired = module.IsRequired,
                    lesson.Code,
                    lesson.Title,
                    lesson.LessonType,
                    lesson.EstimatedMinutes,
                    lesson.IsRequired,
                    lesson.CompletionRule,
                })
            .ToListAsync();

        return rows
            .Select(r => new CourseLessonInfo(
                r.Id,
                r.ModuleId,
                r.ModuleTitle,
                r.Code,
                r.Title,
                r.LessonType,
                r.EstimatedMinutes,
                r.IsRequired,
                r.CompletionRule,
                r.ModuleRequired && r.IsRequired && IsSelfCompletable(r.CompletionRule)))
            .ToList();
    }

    public async Task<HashSet<Guid>> LoadCompletedLessonIdsAsync(Guid enrollmentId)
    {
        var ids = await _context.LessonProgresses
            .AsNoTracking()
            .Where(p => p.EnrollmentId == enrollmentId && p.Status == Statuses.LessonProgress.Completed)
            .Select(p => p.LessonId)
            .ToListAsync();
        return ids.ToHashSet();
    }

    public static decimal CalculatePercent(IReadOnlyCollection<CourseLessonInfo> lessons, IReadOnlySet<Guid> completedLessonIds)
    {
        var tracked = lessons.Where(l => l.CountsForProgress).ToList();
        if (tracked.Count == 0)
        {
            return 0m;
        }

        var done = tracked.Count(l => completedLessonIds.Contains(l.LessonId));
        return Math.Min(100m, Math.Round(done * 100m / tracked.Count, 2, MidpointRounding.AwayFromZero));
    }

    /// <summary>Đã học đủ bài bắt buộc (khóa không có bài tự hoàn thành → coi như đủ).</summary>
    public static bool IsLessonWorkDone(IReadOnlyCollection<CourseLessonInfo> lessons, IReadOnlySet<Guid> completedLessonIds) =>
        lessons.Where(l => l.CountsForProgress).All(l => completedLessonIds.Contains(l.LessonId));

    public Task<bool> HasPublishedFinalAssessmentAsync(Guid courseId) =>
        _context.Assessments.AsNoTracking().AnyAsync(a =>
            a.CourseId == courseId && a.IsFinal && a.Status == Statuses.Assessment.Published);

    /// <summary>
    /// Cập nhật progress_percent + trạng thái của enrollment (đang được track) sau khi bài học thay đổi.
    /// Gọi SAU khi lesson_progress đã được lưu.
    /// </summary>
    public async Task RecalculateAsync(Enrollment enrollment, DateTimeOffset now)
    {
        if (enrollment.Status == Statuses.Enrollment.Completed)
        {
            return; // Đã hoàn thành: ôn lại bài không làm đổi trạng thái / tiến độ
        }

        var lessons = await LoadLessonsAsync(enrollment.CourseId);
        var completed = await LoadCompletedLessonIdsAsync(enrollment.Id);

        enrollment.ProgressPercent = CalculatePercent(lessons, completed);

        if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt ??= now;
        }

        if (enrollment.Status == Statuses.Enrollment.InProgress && lessons.Any(l => l.CountsForProgress) && IsLessonWorkDone(lessons, completed))
        {
            if (await HasPublishedFinalAssessmentAsync(enrollment.CourseId))
            {
                enrollment.Status = Statuses.Enrollment.ReadyForAssessment;
            }
            else
            {
                enrollment.Status = Statuses.Enrollment.Completed;
                enrollment.CompletedAt = now;
            }
        }
    }
}
