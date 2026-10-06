using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class GetCourseAssignmentByIdUseCase : IUseCase<GetCourseAssignmentByIdInput, AssignmentRow>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCourseAssignmentByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AssignmentRow> ExecuteAsync(GetCourseAssignmentByIdInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoonThreshold = today.AddDays(7);

        var result = await (
            from ca in _context.CourseAssignments.AsNoTracking()
            join emp in _context.Employees.AsNoTracking() on ca.EmployeeId equals emp.Id
            join course in _context.Courses.AsNoTracking() on ca.CourseId equals course.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            join pos in _context.JobPositions.AsNoTracking() on emp.JobPositionId equals pos.Id into posJoin
            from pos in posJoin.DefaultIfEmpty()
            join assignedBy in _context.Users.AsNoTracking() on ca.AssignedByUserId equals assignedBy.Id into userJoin
            from assignedBy in userJoin.DefaultIfEmpty()
            join enrollment in _context.Enrollments.AsNoTracking() on ca.Id equals enrollment.CourseAssignmentId into enrollJoin
            from enrollment in enrollJoin.DefaultIfEmpty()
            where ca.Id == input.Id && course.OrganizationId == organizationId
            select new AssignmentRow
            {
                Id = ca.Id,
                EmployeeId = ca.EmployeeId,
                EmployeeName = emp.FullName,
                EmployeeCode = emp.EmployeeCode,
                DepartmentName = dept != null ? dept.Name : null,
                PositionName = pos != null ? pos.Name : null,
                CourseId = ca.CourseId,
                CourseCode = course.Code,
                CourseTitle = course.Title,
                AssignedAt = ca.AssignedAt,
                AssignedByName = assignedBy != null ? assignedBy.DisplayName : "",
                DueDate = ca.DueDate != null ? ca.DueDate.Value.ToString("yyyy-MM-dd") : null,
                Status = ca.Status,
                ProgressPercent = enrollment != null ? (int)enrollment.ProgressPercent : 0,
                CompletedAt = enrollment != null ? enrollment.CompletedAt : null,
                Source = ca.AssignmentSource,
                Overdue = ca.DueDate != null && ca.DueDate < today && ca.Status != Statuses.Enrollment.Completed && ca.Status != Statuses.Enrollment.Cancelled,
                DueSoon = ca.DueDate != null && ca.DueDate >= today && ca.DueDate <= dueSoonThreshold && ca.Status != Statuses.Enrollment.Completed && ca.Status != Statuses.Enrollment.Cancelled,
            }
        ).FirstOrDefaultAsync()
        ?? throw new NotFoundException("Course assignment not found.");

        return result;
    }
}
