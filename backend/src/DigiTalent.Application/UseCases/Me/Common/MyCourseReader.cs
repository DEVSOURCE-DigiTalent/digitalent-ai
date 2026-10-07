using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>1 khóa nhân viên đang ghi danh (enrollment còn hiệu lực) kèm số liệu tiến độ.</summary>
public sealed record MyCourseRow(
    Enrollment Enrollment,
    Course Course,
    short Level,
    string? CategoryName,
    int TrackedLessons,
    int CompletedTrackedLessons,
    CourseAssignment? Assignment,
    string? AssignedByName,
    Certificate? Certificate)
{
    public bool IsOverdue(DateOnly today) =>
        Enrollment.Status != Statuses.Enrollment.Completed && Enrollment.DueDate.HasValue && Enrollment.DueDate.Value < today;

    /// <summary>ASSIGNED (HR/Manager giao) | SELF_ENROLLED (tự ghi danh)</summary>
    public string Source => Enrollment.CourseAssignmentId.HasValue ? "ASSIGNED" : "SELF_ENROLLED";
}

/// <summary>Đọc các khóa của chính nhân viên theo lô (dùng cho EM-01, EM-05, EM-06).</summary>
public class MyCourseReader
{
    private readonly IApplicationDbContext _context;

    public MyCourseReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyCourseRow>> LoadAsync(Guid employeeId)
    {
        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId && e.Status != Statuses.Enrollment.Cancelled)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
        if (enrollments.Count == 0)
        {
            return new List<MyCourseRow>();
        }

        var courseIds = enrollments.Select(e => e.CourseId).Distinct().ToList();
        var enrollmentIds = enrollments.Select(e => e.Id).ToList();

        var courses = await _context.Courses.AsNoTracking().Where(c => courseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);
        var teachings = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where courseIds.Contains(teaching.CourseId)
                select new { teaching.CourseId, teaching.TargetLevel, teaching.CoverageType, CategoryName = category.Name })
            .ToListAsync();

        var lessons = await (
                from lesson in _context.Lessons.AsNoTracking()
                join module in _context.CourseModules.AsNoTracking() on lesson.ModuleId equals module.Id
                where courseIds.Contains(module.CourseId)
                      && module.Status == Statuses.CourseContent.Active
                      && lesson.Status == Statuses.CourseContent.Active
                      && module.IsRequired
                      && lesson.IsRequired
                select new { lesson.Id, module.CourseId, lesson.CompletionRule })
            .ToListAsync();
        var trackedLessons = lessons.Where(l => MyLearningProgressService.IsSelfCompletable(l.CompletionRule)).ToList();

        var completed = await _context.LessonProgresses
            .AsNoTracking()
            .Where(p => enrollmentIds.Contains(p.EnrollmentId) && p.Status == Statuses.LessonProgress.Completed)
            .Select(p => new { p.EnrollmentId, p.LessonId })
            .ToListAsync();

        var assignmentIds = enrollments.Where(e => e.CourseAssignmentId.HasValue).Select(e => e.CourseAssignmentId!.Value).ToList();
        var assignments = await _context.CourseAssignments.AsNoTracking().Where(a => assignmentIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id);
        var assignerIds = assignments.Values.Select(a => a.AssignedByUserId).Distinct().ToList();
        var assignerNames = await _context.Users.AsNoTracking().Where(u => assignerIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var certificates = (await _context.Certificates
                .AsNoTracking()
                .Where(c => enrollmentIds.Contains(c.EnrollmentId) && c.Status != Statuses.Certificate.Revoked)
                .ToListAsync())
            .GroupBy(c => c.EnrollmentId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(c => c.IssuedAt).First());

        return enrollments
            .Where(e => courses.ContainsKey(e.CourseId))
            .Select(e =>
            {
                var courseTeachings = teachings.Where(t => t.CourseId == e.CourseId).ToList();
                var tracked = trackedLessons.Where(l => l.CourseId == e.CourseId).Select(l => l.Id).ToHashSet();
                var assignment = e.CourseAssignmentId.HasValue ? assignments.GetValueOrDefault(e.CourseAssignmentId.Value) : null;
                var course = courses[e.CourseId];

                return new MyCourseRow(
                    e,
                    course,
                    LevelOf(course, courseTeachings.Select(t => t.TargetLevel)),
                    courseTeachings
                        .OrderBy(t => t.CoverageType == Statuses.CourseCoverageType.Primary ? 0 : 1)
                        .Select(t => t.CategoryName)
                        .FirstOrDefault(),
                    tracked.Count,
                    completed.Count(c => c.EnrollmentId == e.Id && tracked.Contains(c.LessonId)),
                    assignment,
                    assignment == null ? null : assignerNames.GetValueOrDefault(assignment.AssignedByUserId),
                    certificates.GetValueOrDefault(e.Id));
            })
            .ToList();
    }

    /// <summary>Cấp độ khóa = target_level cao nhất của các năng lực khóa dạy; không có thì entry_level + 1.</summary>
    public static short LevelOf(Course course, IEnumerable<short> targetLevels)
    {
        var max = targetLevels.DefaultIfEmpty((short)0).Max();
        return max > 0 ? max : (short)Math.Clamp((course.EntryLevel ?? 0) + 1, 1, 3);
    }
}
