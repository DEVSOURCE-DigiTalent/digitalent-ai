using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class CreateCourseAssignmentUseCase : IUseCase<CreateCourseAssignmentInput, CreateCourseAssignmentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationSender _notificationSender;
    private readonly IAppEmailSender _emailSender;
    private readonly ILogger<CreateCourseAssignmentUseCase> _logger;

    public CreateCourseAssignmentUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        INotificationSender notificationSender,
        IAppEmailSender emailSender,
        ILogger<CreateCourseAssignmentUseCase> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationSender = notificationSender;
        _emailSender = emailSender;
        _logger = logger;
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

            if (emp.UserId.HasValue)
            {
                var notiTitle = $"Khóa học mới: {course.Title}";
                var notiMsg = dueDate.HasValue
                    ? $"Bạn vừa được phân công khóa học '{course.Title}'. Hạn hoàn thành: {dueDate.Value:dd/MM/yyyy}."
                    : $"Bạn vừa được phân công khóa học '{course.Title}'.";

                _context.Notifications.Add(new Notification
                {
                    RecipientUserId = emp.UserId.Value,
                    Type = "COURSE_ASSIGNMENT",
                    Title = notiTitle,
                    Message = notiMsg,
                    RelatedEntityType = "COURSE",
                    RelatedEntityId = course.Id,
                    IsRead = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        if (output.Created.Count > 0)
        {
            await _context.SaveChangesAsync();

            // Gửi SignalR và Email ngầm sau khi lưu thành công vào database
            _ = Task.Run(async () =>
            {
                try
                {
                    foreach (var row in output.Created)
                    {
                        var emp = targetEmployees.FirstOrDefault(e => e.Id == row.EmployeeId);
                        if (emp == null) continue;

                        if (emp.UserId.HasValue)
                        {
                            try
                            {
                                await _notificationSender.SendNotificationToUserAsync(
                                    emp.UserId.Value,
                                    $"Khóa học mới: {course.Title}",
                                    dueDate.HasValue
                                        ? $"Bạn vừa được phân công khóa học '{course.Title}'. Hạn hoàn thành: {dueDate.Value:dd/MM/yyyy}."
                                        : $"Bạn vừa được phân công khóa học '{course.Title}'.",
                                    "COURSE_ASSIGNMENT");
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "[CreateCourseAssignmentUseCase] Realtime notification failed for user {UserId}", emp.UserId.Value);
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(emp.WorkEmail))
                        {
                            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: sans-serif; background-color: #f7f9fd; padding: 24px; color: #172442;'>
    <div style='max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; border: 1px solid #dfe6f3;'>
        <h2 style='color: #304bdf; margin-top: 0;'>DigiTalent AI</h2>
        <h3 style='color: #172442;'>Thông báo phân công khóa học</h3>
        <p>Kính gửi <strong>{emp.FullName}</strong>,</p>
        <p>Bạn vừa được phân công tham gia khóa học: <strong>{course.Code} · {course.Title}</strong>.</p>
        {(dueDate.HasValue ? $"<div style='background: #fff7ed; border-left: 4px solid #f97316; padding: 12px; margin: 16px 0;'><strong>Hạn hoàn thành:</strong> {dueDate.Value:dd/MM/yyyy}</div>" : "")}
        <p style='text-align: center; margin-top: 24px;'>
            <a href='http://localhost:5173/enterprise/my-learning' style='background: #304bdf; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Bắt đầu học ngay</a>
        </p>
    </div>
</body>
</html>";
                            await _emailSender.SendEmailAsync(
                                emp.WorkEmail,
                                emp.FullName,
                                $"[DigiTalent AI] Phân công khóa học: {course.Title}",
                                htmlBody);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[CreateCourseAssignmentUseCase] Error during async notification dispatch.");
                }
            });
        }

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
