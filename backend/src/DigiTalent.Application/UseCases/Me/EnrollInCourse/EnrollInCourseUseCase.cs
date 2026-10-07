using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// Tự ghi danh khóa tự chọn (UC-41) từ lộ trình / gợi ý: tạo enrollment không gắn course_assignment.
/// Điều kiện xem MyEnrollmentRules.
/// </summary>
public class EnrollInCourseUseCase : IUseCase<EnrollInCourseUseCaseInput, EnrollInCourseUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyEnrollmentRules _rules;

    public EnrollInCourseUseCase(IApplicationDbContext context, MyEmployeeContext me, MyEnrollmentRules rules)
    {
        _context = context;
        _me = me;
        _rules = rules;
    }

    public async Task<EnrollInCourseUseCaseOutput> ExecuteAsync(EnrollInCourseUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == input.CourseId && c.OrganizationId == employee.OrganizationId)
            ?? throw new NotFoundException("Không tìm thấy khóa học.");

        var check = await _rules.CheckAsync(employee, course);
        if (!check.CanEnroll)
        {
            throw new ConflictException(check.Reason ?? "Không thể ghi danh khóa học này.");
        }

        var enrollment = new Enrollment
        {
            EmployeeId = employee.Id,
            CourseId = course.Id,
            Status = Statuses.Enrollment.NotStarted,
            ProgressPercent = 0,
        };
        _context.Enrollments.Add(enrollment);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // ux_enrollments_one_active: request ghi danh song song
            throw new ConflictException("Bạn đã ghi danh khóa học này.");
        }

        return new EnrollInCourseUseCaseOutput { EnrollmentId = enrollment.Id, CourseId = course.Id, Status = enrollment.Status };
    }
}
