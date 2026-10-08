using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class CancelCourseAssignmentUseCase : IUseCase<CancelCourseAssignmentInput, CancelCourseAssignmentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CancelCourseAssignmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CancelCourseAssignmentOutput> ExecuteAsync(CancelCourseAssignmentInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var assignment = await (
            from ca in _context.CourseAssignments
            join course in _context.Courses.AsNoTracking() on ca.CourseId equals course.Id
            where ca.Id == input.Id && course.OrganizationId == organizationId
            select ca
        ).FirstOrDefaultAsync();

        if (assignment == null)
            throw new NotFoundException($"Course assignment '{input.Id}' not found.");

        if (assignment.Status == Statuses.Enrollment.Completed)
            throw new BadRequestException("Không thể hủy phân công đã hoàn thành.");

        if (assignment.Status == Statuses.Enrollment.Cancelled)
            throw new BadRequestException("Phân công này đã bị hủy trước đó.");

        assignment.Status = Statuses.Enrollment.Cancelled;

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.CourseAssignmentId == input.Id);
        if (enrollment != null)
            enrollment.Status = Statuses.Enrollment.Cancelled;

        await _context.SaveChangesAsync();

        return new CancelCourseAssignmentOutput { Id = input.Id };
    }
}
