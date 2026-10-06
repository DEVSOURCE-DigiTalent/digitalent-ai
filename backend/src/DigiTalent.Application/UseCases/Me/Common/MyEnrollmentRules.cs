using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

public class MyPrerequisiteDto
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public bool Completed { get; set; }
}

public sealed record EnrollCheck(bool CanEnroll, string? Reason, IReadOnlyList<MyPrerequisiteDto> Prerequisites);

/// <summary>
/// Tự ghi danh khóa tự chọn (UC-41 "nếu mở"): khóa PUBLISHED, bản mới nhất của mã khóa, nhân viên ACTIVE,
/// chưa học / chưa hoàn thành mã khóa này, và đủ điều kiện vào khóa theo cùng quy tắc với gợi ý khóa học
/// (CourseEligibility: xong khóa tiên quyết HOẶC mức đã xác nhận thấp nhất ≥ mức khóa − 1).
/// </summary>
public class MyEnrollmentRules
{
    private readonly IApplicationDbContext _context;

    public MyEnrollmentRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<MyPrerequisiteDto>> LoadPrerequisitesAsync(Guid employeeId, Guid courseId)
    {
        var prerequisites = await (
                from prerequisite in _context.CoursePrerequisites.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on prerequisite.PrerequisiteCourseId equals course.Id
                where prerequisite.CourseId == courseId
                orderby course.Code
                select new { course.Id, course.Code, course.Title })
            .ToListAsync();
        if (prerequisites.Count == 0)
        {
            return Array.Empty<MyPrerequisiteDto>();
        }

        var completedCodes = await CompletedCourseCodesAsync(employeeId);
        return prerequisites
            .Select(p => new MyPrerequisiteDto { CourseId = p.Id, Code = p.Code, Title = p.Title, Completed = completedCodes.Contains(p.Code) })
            .ToList();
    }

    public async Task<HashSet<string>> CompletedCourseCodesAsync(Guid employeeId) =>
        (await (
                from enrollment in _context.Enrollments.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employeeId && enrollment.Status == Statuses.Enrollment.Completed
                select course.Code)
            .ToListAsync())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    public async Task<EnrollCheck> CheckAsync(Employee employee, Course course)
    {
        var prerequisites = await LoadPrerequisitesAsync(employee.Id, course.Id);

        if (employee.Status != Statuses.Employee.Active)
        {
            return new EnrollCheck(false, "Hồ sơ nhân viên của bạn không ở trạng thái hoạt động.", prerequisites);
        }

        if (course.OrganizationId != employee.OrganizationId || course.Status != Statuses.Course.Published)
        {
            return new EnrollCheck(false, "Khóa học chưa mở để ghi danh.", prerequisites);
        }

        var hasNewerVersion = await _context.Courses.AsNoTracking().AnyAsync(c =>
            c.OrganizationId == course.OrganizationId && c.Code == course.Code
            && c.Status == Statuses.Course.Published && c.VersionNo > course.VersionNo);
        if (hasNewerVersion)
        {
            return new EnrollCheck(false, "Khóa học đã có phiên bản mới hơn.", prerequisites);
        }

        var existing = await (
                from enrollment in _context.Enrollments.AsNoTracking()
                join c in _context.Courses.AsNoTracking() on enrollment.CourseId equals c.Id
                where enrollment.EmployeeId == employee.Id
                      && c.OrganizationId == course.OrganizationId
                      && c.Code == course.Code
                      && enrollment.Status != Statuses.Enrollment.Cancelled
                select enrollment.Status)
            .ToListAsync();
        if (existing.Contains(Statuses.Enrollment.Completed))
        {
            return new EnrollCheck(false, "Bạn đã hoàn thành khóa học này.", prerequisites);
        }

        if (existing.Count > 0)
        {
            return new EnrollCheck(false, "Bạn đã ghi danh khóa học này.", prerequisites);
        }

        var eligibility = await EligibilityAsync(employee.Id, course.Id, prerequisites);
        if (!eligibility.IsMet)
        {
            var missing = string.Join(", ", prerequisites.Where(p => !p.Completed).Select(p => p.Code));
            return new EnrollCheck(false, $"Cần hoàn thành khóa tiên quyết trước: {missing}.", prerequisites);
        }

        return new EnrollCheck(true, null, prerequisites);
    }

    private async Task<CourseEligibility> EligibilityAsync(Guid employeeId, Guid courseId, IReadOnlyList<MyPrerequisiteDto> prerequisites)
    {
        var teachings = await _context.CourseCompetencies
            .AsNoTracking()
            .Where(t => t.CourseId == courseId)
            .Select(t => new { t.CompetencyId, t.TargetLevel })
            .ToListAsync();
        if (teachings.Count == 0)
        {
            return new CourseEligibility(prerequisites.All(p => p.Completed), 0, 1);
        }

        var competencyIds = teachings.Select(t => t.CompetencyId).ToList();
        var confirmed = await _context.EmployeeCompetencyProfiles
            .AsNoTracking()
            .Where(p => p.EmployeeId == employeeId && competencyIds.Contains(p.CompetencyId))
            .ToDictionaryAsync(p => p.CompetencyId, p => p.ConfirmedLevel);

        return new CourseEligibility(
            prerequisites.All(p => p.Completed),
            teachings.Min(t => confirmed.GetValueOrDefault(t.CompetencyId)),
            teachings.Max(t => t.TargetLevel));
    }
}
