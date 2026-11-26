using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// A course whose content changes in a company — a DigiTalent version applied to it, or the company's R&amp;D applying
/// its edited content — is learned again from the start by everyone: every enrollment of the course in the company
/// (in progress or completed) is cancelled, kept as history. So the level that course confirmed no longer counts
/// (levels and the roadmap only read completed enrollments), a course final waiting for a mentor leaves the queue
/// (it skips cancelled enrollments) and the next start opens the current content. Certificates stay: they are the
/// PASSED submissions, which are not touched. Changes are tracked; the caller saves.
/// </summary>
public static class CourseRelearn
{
    public const string NotificationType = "COURSE_RELEARN";

    public sealed record Result(int Employees, int Passed);

    public static async Task<Result> ResetAsync(IApplicationDbContext context, Guid organizationId, IReadOnlyCollection<string> courseCodes)
    {
        var codes = courseCodes.SelectMany(CourseCodes.Aliases).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        if (codes.Count == 0)
        {
            return new Result(0, 0);
        }

        var rows = await (
                from enrollment in context.Enrollments
                join course in context.Courses on enrollment.CourseId equals course.Id
                where course.OrganizationId == organizationId && codes.Contains(course.Code)
                      && enrollment.Status != Statuses.Enrollment.Cancelled
                select new { Enrollment = enrollment, course.Title })
            .ToListAsync();
        if (rows.Count == 0)
        {
            return new Result(0, 0);
        }

        foreach (var row in rows)
        {
            row.Enrollment.Status = Statuses.Enrollment.Cancelled;
        }

        var byEmployee = rows.GroupBy(r => r.Enrollment.EmployeeId).ToList();
        var employeeIds = byEmployee.Select(g => g.Key).ToList();
        var users = await context.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id) && e.UserId != null)
            .ToDictionaryAsync(e => e.Id, e => e.UserId!.Value);
        foreach (var group in byEmployee)
        {
            if (!users.TryGetValue(group.Key, out var userId)) continue;
            var titles = string.Join(", ", group.Select(r => r.Title).Distinct());
            context.Notifications.Add(new Notification
            {
                RecipientUserId = userId,
                Type = NotificationType,
                Title = "Khóa học có nội dung mới",
                Message = $"Công ty vừa áp dụng nội dung mới cho: {titles}. Bạn học lại khóa từ đầu; chứng nhận đã nhận vẫn được giữ.",
                RelatedEntityType = "courses",
            });
        }

        return new Result(employeeIds.Count, rows.Count(r => r.Enrollment.Status == Statuses.Enrollment.Cancelled && r.Enrollment.CompletedAt != null));
    }
}
