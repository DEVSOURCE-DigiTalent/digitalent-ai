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
        var targetIds = targetEmployees.Select(e => e.Id).ToList();
        var versionIds = await _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.Code == course.Code)
            .Select(c => c.Id).ToListAsync();
        var existingAssignments = await _context.CourseAssignments.AsNoTracking()
            .Where(ca => versionIds.Contains(ca.CourseId) && ca.Status == Statuses.CourseAssignment.Active
                && targetIds.Contains(ca.EmployeeId))
            .Select(ca => ca.EmployeeId).Distinct().ToListAsync();
        var completedEnrollments = await _context.Enrollments.AsNoTracking()
            .Where(e => versionIds.Contains(e.CourseId) && e.Status == Statuses.Enrollment.Completed
                && targetIds.Contains(e.EmployeeId))
            .Select(e => e.EmployeeId).Distinct().ToListAsync();

        var isPaidCourse = course.Code.EndsWith("-I", StringComparison.OrdinalIgnoreCase) ||
                           course.Code.EndsWith("-A", StringComparison.OrdinalIgnoreCase) ||
                           course.EntryLevel >= 2;
        if (isPaidCourse)
        {
            var purchasedSeats = await (
                from o in _context.CourseSeatOrders.AsNoTracking()
                join pc in _context.PlatformCourses.AsNoTracking() on o.CourseId equals pc.Id
                where o.OrganizationId == organizationId && pc.Code == course.Code
                select (int?)o.Seats
            ).SumAsync() ?? 0;

            var usedSeats = await _context.CourseAssignments.AsNoTracking()
                .Where(ca => versionIds.Contains(ca.CourseId) && ca.Status == Statuses.CourseAssignment.Active)
                .Select(ca => ca.EmployeeId).Distinct().CountAsync();

            var availableSeats = Math.Max(0, purchasedSeats - usedSeats);
            var neededSeats = targetEmployees.Count(e => e.Status == Statuses.Employee.Active
                && !existingAssignments.Contains(e.Id) && !completedEnrollments.Contains(e.Id));
            if (availableSeats < neededSeats)
            {
                var price = course.Code.EndsWith("-A", StringComparison.OrdinalIgnoreCase) ? "699.000 ₫" : "399.000 ₫";
                throw new BadRequestException(
                    $"Khóa học '{course.Title}' là khóa học có phí ({price}/suất). Tổ chức hiện có {purchasedSeats} suất ({usedSeats} đã phân công, còn {availableSeats} suất). Cần mua thêm suất học để phân công cho nhân viên.");
            }
        }

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
