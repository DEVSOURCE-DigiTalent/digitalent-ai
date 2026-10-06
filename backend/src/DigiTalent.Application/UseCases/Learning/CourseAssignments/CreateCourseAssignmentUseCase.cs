using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class CreateCourseAssignmentUseCase : IUseCase<CreateCourseAssignmentInput, CreateCourseAssignmentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateCourseAssignmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateCourseAssignmentOutput> ExecuteAsync(CreateCourseAssignmentInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId!.Value;

        var course = await _context.Courses.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == input.CourseId && c.OrganizationId == organizationId);
        if (course == null)
            throw new NotFoundException($"Course '{input.CourseId}' not found.");

        if (course.Status != Statuses.Course.Published)
            throw new BadRequestException("Chỉ giao được khóa học đã xuất bản.");

        var targetEmployees = await ResolveTargetEmployees(organizationId, input.Targets);

        var existingAssignments = await _context.CourseAssignments.AsNoTracking()
            .Where(ca => ca.CourseId == input.CourseId && ca.Status == "ACTIVE"
                && targetEmployees.Select(e => e.Id).Contains(ca.EmployeeId))
            .Select(ca => ca.EmployeeId)
            .ToListAsync();

        var completedEnrollments = await _context.Enrollments.AsNoTracking()
            .Where(e => e.CourseId == input.CourseId && e.Status == Statuses.Enrollment.Completed
                && targetEmployees.Select(t => t.Id).Contains(e.EmployeeId))
            .Select(e => e.EmployeeId)
            .ToListAsync();

        DateOnly? dueDate = null;
        if (!string.IsNullOrWhiteSpace(input.DueDate) && DateOnly.TryParse(input.DueDate, out var parsed))
            dueDate = parsed;

        var output = new CreateCourseAssignmentOutput();

        foreach (var emp in targetEmployees)
        {
            if (completedEnrollments.Contains(emp.Id))
            {
                output.Skipped.Add(new SkippedEmployee { EmployeeId = emp.Id, EmployeeName = emp.FullName, Reason = "ALREADY_COMPLETED" });
                continue;
            }
            if (existingAssignments.Contains(emp.Id))
            {
                output.Skipped.Add(new SkippedEmployee { EmployeeId = emp.Id, EmployeeName = emp.FullName, Reason = "ALREADY_ASSIGNED" });
                continue;
            }

            if (emp.Status != Statuses.Employee.Active)
            {
                output.Skipped.Add(new SkippedEmployee { EmployeeId = emp.Id, EmployeeName = emp.FullName, Reason = "NOT_ACTIVE" });
                continue;
            }

            var assignment = new CourseAssignment
            {
                CourseId = input.CourseId,
                EmployeeId = emp.Id,
                AssignmentSource = "MANUAL",
                SourceDepartmentId = emp.DepartmentId,
                SourceJobPositionId = emp.JobPositionId,
                AssignedByUserId = userId,
                AssignedAt = DateTimeOffset.UtcNow,
                DueDate = dueDate,
                Status = "ACTIVE",
            };
            _context.CourseAssignments.Add(assignment);

            var enrollment = new Enrollment
            {
                CourseAssignmentId = assignment.Id,
                EmployeeId = emp.Id,
                CourseId = input.CourseId,
                Status = Statuses.Enrollment.NotStarted,
                ProgressPercent = 0,
                DueDate = dueDate,
            };
            _context.Enrollments.Add(enrollment);

            output.Created.Add(new AssignmentRow
            {
                Id = assignment.Id,
                EmployeeId = emp.Id,
                EmployeeName = emp.FullName,
                EmployeeCode = emp.EmployeeCode,
                CourseId = input.CourseId,
                CourseCode = course.Code,
                CourseTitle = course.Title,
                AssignedAt = assignment.AssignedAt,
                DueDate = dueDate?.ToString("yyyy-MM-dd"),
                Status = "ACTIVE",
                ProgressPercent = 0,
                Source = "MANUAL",
            });
        }

        if (output.Created.Count > 0)
            await _context.SaveChangesAsync();

        return output;
    }

    private async Task<List<Employee>> ResolveTargetEmployees(Guid organizationId, CreateAssignmentTargets targets)
    {
        var query = _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == organizationId);

        if (targets.EmployeeIds is { Count: > 0 })
        {
            query = query.Where(e => targets.EmployeeIds.Contains(e.Id));
        }
        else
        {
            if (targets.DepartmentId.HasValue)
                query = query.Where(e => e.DepartmentId == targets.DepartmentId.Value);

            if (targets.JobPositionId.HasValue)
                query = query.Where(e => e.JobPositionId == targets.JobPositionId.Value);
        }

        return await query.ToListAsync();
    }
}
