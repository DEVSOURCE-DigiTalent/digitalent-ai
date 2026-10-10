using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class EnrollInCourseUseCase : IUseCase<EnrollInCourseUseCaseInput, EnrollInCourseUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public EnrollInCourseUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<EnrollInCourseUseCaseOutput> ExecuteAsync(EnrollInCourseUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");
        var orgId = _currentUser.GetRequiredOrganizationId();

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == input.CourseId && c.OrganizationId == orgId && c.Status == Statuses.Course.Published)
            .Select(c => new { c.Id, c.Title })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Published course '{input.CourseId}' not found.");

        var existing = await _context.Enrollments
            .AsNoTracking()
            .AnyAsync(e => e.EmployeeId == employeeId && e.CourseId == input.CourseId
                && e.Status != Statuses.Enrollment.Cancelled);

        if (existing)
            throw new ConflictException("Already enrolled in this course.");

        var prerequisiteIds = await _context.CoursePrerequisites
            .AsNoTracking()
            .Where(p => p.CourseId == input.CourseId)
            .Select(p => p.PrerequisiteCourseId)
            .ToListAsync();

        if (prerequisiteIds.Count > 0)
        {
            var completedPrereqs = await _context.Enrollments
                .AsNoTracking()
                .CountAsync(e => e.EmployeeId == employeeId
                    && prerequisiteIds.Contains(e.CourseId)
                    && e.Status == Statuses.Enrollment.Completed);

            if (completedPrereqs < prerequisiteIds.Count)
                throw new BadRequestException("Prerequisites not completed.", "CourseId", "PREREQUISITES_NOT_MET");
        }

        var enrollment = new Enrollment
        {
            EmployeeId = employeeId,
            CourseId = input.CourseId,
            Status = Statuses.Enrollment.NotStarted,
            ProgressPercent = 0
        };
        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return new EnrollInCourseUseCaseOutput
        {
            EnrollmentId = enrollment.Id,
            CourseId = input.CourseId,
            CourseTitle = course.Title,
            Status = enrollment.Status
        };
    }
}
