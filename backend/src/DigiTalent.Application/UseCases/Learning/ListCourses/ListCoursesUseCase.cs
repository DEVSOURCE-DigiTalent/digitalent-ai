using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class ListCoursesUseCase : IUseCase<ListCoursesUseCaseInput, ListCoursesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ListCoursesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ListCoursesUseCaseOutput> ExecuteAsync(ListCoursesUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var employeeId = _currentUser.EmployeeId;

        var courses = await _context.Courses
            .AsNoTracking()
            .Where(c => c.OrganizationId == orgId && c.Status == Statuses.Course.Published)
            .OrderBy(c => c.Code)
            .Select(c => new CourseCatalogDto
            {
                CourseId = c.Id,
                Code = c.Code,
                Title = c.Title,
                Description = c.Description,
                EntryLevel = c.EntryLevel,
                EstimatedDurationMinutes = c.EstimatedDurationMinutes,
                Status = c.Status
            })
            .ToListAsync();

        if (employeeId.HasValue)
        {
            var myEnrollments = await _context.Enrollments
                .AsNoTracking()
                .Where(e => e.EmployeeId == employeeId.Value)
                .Select(e => new { e.CourseId, e.Status })
                .ToListAsync();

            var completedCourseIds = myEnrollments
                .Where(e => e.Status == Statuses.Enrollment.Completed)
                .Select(e => e.CourseId)
                .ToHashSet();

            var enrolledCourseIds = myEnrollments
                .Select(e => e.CourseId)
                .ToHashSet();

            var prerequisites = await _context.CoursePrerequisites
                .AsNoTracking()
                .ToListAsync();

            foreach (var course in courses)
            {
                course.IsEnrolled = enrolledCourseIds.Contains(course.CourseId);

                var prereqIds = prerequisites
                    .Where(p => p.CourseId == course.CourseId)
                    .Select(p => p.PrerequisiteCourseId)
                    .ToList();

                course.PrerequisitesMet = prereqIds.Count == 0
                    || prereqIds.All(pid => completedCourseIds.Contains(pid));
            }
        }
        else
        {
            foreach (var course in courses)
                course.PrerequisitesMet = true;
        }

        return new ListCoursesUseCaseOutput { Courses = courses };
    }
}
