using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Reports.GetLearningActivity;

/// <summary>
/// The owner's overview of learning (OW-01), from the enrollments of the active employees in scope (owner: the
/// organization, department manager: the department): who has a course open now, how many courses were finished, how
/// many were started and finished each week, and the latest completions. A bought course is open to every employee, so
/// enrollments are counted whether or not a course was assigned. Cancelled enrollments are ignored.
/// </summary>
public sealed class GetLearningActivityUseCase(
    IApplicationDbContext context,
    ICurrentUser user,
    EmployeeScope scope,
    PulseCatalogReader catalog,
    TimeProvider clock) : IUseCase<GetLearningActivityInput, GetLearningActivityOutput>
{
    private const int RecentCount = 5;
    private static readonly string[] DomainCodes = ["TT02_D1", "TT02_D2", "TT02_D3", "TT02_D4", "TT02_D5", "TT02_D6"];
    private static readonly string[] OpenStatuses = [Statuses.Enrollment.InProgress, Statuses.Enrollment.ReadyForAssessment];

    public async Task<GetLearningActivityOutput> ExecuteAsync(GetLearningActivityInput input)
    {
        var organizationId = user.GetRequiredOrganizationId();
        var names = await scope.VisibleEmployees().AsNoTracking()
            .Where(e => e.Status == Statuses.Employee.Active)
            .ToDictionaryAsync(e => e.Id, e => e.FullName);
        var ids = names.Keys.ToList();

        var enrollments = await (
                from enrollment in context.Enrollments.AsNoTracking()
                join course in context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where ids.Contains(enrollment.EmployeeId) && course.OrganizationId == organizationId
                    && enrollment.Status != Statuses.Enrollment.Cancelled
                select new { enrollment.EmployeeId, enrollment.Status, enrollment.StartedAt, enrollment.CompletedAt, course.Code, course.Title })
            .ToListAsync();

        var now = clock.GetUtcNow();
        var thisWeek = WeekStart(DateOnly.FromDateTime(now.UtcDateTime));
        var open = enrollments.Where(e => OpenStatuses.Contains(e.Status)).ToList();
        var completed = enrollments.Where(e => e.Status == Statuses.Enrollment.Completed && e.CompletedAt != null).ToList();

        var weeks = Enumerable.Range(0, input.Weeks)
            .Select(index => thisWeek.AddDays(-7 * (input.Weeks - 1 - index)))
            .Select(start => new LearningActivityWeek(
                start,
                enrollments.Count(e => e.StartedAt is DateTimeOffset at && WeekStart(DateOnly.FromDateTime(at.UtcDateTime)) == start),
                completed.Count(e => WeekStart(DateOnly.FromDateTime(e.CompletedAt!.Value.UtcDateTime)) == start)))
            .ToList();

        var latest = completed.OrderByDescending(e => e.CompletedAt).Take(RecentCount).ToList();
        var standard = latest.Count == 0
            ? new Dictionary<string, (int Domain, int Level)>(StringComparer.OrdinalIgnoreCase)
            : await StandardCoursesAsync(organizationId);
        var recent = latest.Select(e =>
        {
            (int Domain, int Level)? place = standard.TryGetValue(e.Code, out var found) ? found : null;
            return new LearningActivityCompletion(e.EmployeeId, names[e.EmployeeId], e.Title, place?.Domain, place?.Level, e.CompletedAt!.Value);
        }).ToList();

        return new GetLearningActivityOutput(
            names.Count,
            open.Select(e => e.EmployeeId).Distinct().Count(),
            open.Count,
            completed.Count,
            completed.Count(e => e.CompletedAt >= now.AddDays(-30)),
            weeks,
            recent);
    }

    /// <summary>Course code (and its aliases) → domain number and level of the 18 standard courses.</summary>
    private async Task<Dictionary<string, (int Domain, int Level)>> StandardCoursesAsync(Guid organizationId)
    {
        var numbers = (await context.CompetencyCategories.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && DomainCodes.Contains(c.Code))
                .Select(c => new { c.Id, c.Code }).ToListAsync())
            .ToDictionary(c => c.Id, c => int.Parse(c.Code[^1..]));
        var result = new Dictionary<string, (int Domain, int Level)>(StringComparer.OrdinalIgnoreCase);
        foreach (var course in await catalog.LoadAsync(organizationId))
        {
            if (!numbers.TryGetValue(course.CategoryId, out var number)) continue;
            foreach (var code in CourseCodes.Aliases(course.Code)) result.TryAdd(code, (number, course.Tier));
        }
        return result;
    }

    private static DateOnly WeekStart(DateOnly day) => day.AddDays(-(((int)day.DayOfWeek + 6) % 7));
}
