using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class CreateCourseAssignmentUseCase : IUseCase<CreateCourseAssignmentInput, CreateCourseAssignmentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly INotificationSender _notificationSender;
    private readonly IAppEmailSender _emailSender;
    private readonly IAppUrlResolver _urlResolver;
    private readonly ILogger<CreateCourseAssignmentUseCase> _logger;

    public CreateCourseAssignmentUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        INotificationSender notificationSender,
        IAppEmailSender emailSender,
        IAppUrlResolver urlResolver,
        ILogger<CreateCourseAssignmentUseCase> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationSender = notificationSender;
        _emailSender = emailSender;
        _urlResolver = urlResolver;
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
        var targetIds = targetEmployees.Select(row => row.Employee.Id).ToList();
        var codes = CourseCodes.Aliases(course.Code);
        var versionIds = await _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && codes.Contains(c.Code))
            .Select(c => c.Id).ToListAsync();
        var existingAssignments = await _context.CourseAssignments.AsNoTracking()
            .Where(ca => versionIds.Contains(ca.CourseId) && ca.Status == Statuses.CourseAssignment.Active
                && targetIds.Contains(ca.EmployeeId))
            .Select(ca => ca.EmployeeId).Distinct().ToListAsync();
        var completedEnrollments = await _context.Enrollments.AsNoTracking()
            .Where(e => versionIds.Contains(e.CourseId) && e.Status == Statuses.Enrollment.Completed
                && targetIds.Contains(e.EmployeeId))
            .Select(e => e.EmployeeId).Distinct().ToListAsync();

        var isPaidCourse = CourseOwnership.IsPaid(course.Code) || course.EntryLevel >= 2;
        if (isPaidCourse && !await CourseOwnership.IsPurchasedAsync(_context, organizationId, course.Code))
        {
            throw new BadRequestException(
                $"Khóa học '{course.Title}' là khóa học có phí. Doanh nghiệp cần mua khóa học trước khi phân công cho nhân viên.",
                "courseId", "COURSE_NOT_PURCHASED");
        }

        DateOnly? dueDate = null;
        if (!string.IsNullOrWhiteSpace(input.DueDate) && DateOnly.TryParse(input.DueDate, out var parsed))
            dueDate = parsed;

        var output = new CreateCourseAssignmentOutput();

        foreach (var row in targetEmployees)
        {
            var emp = row.Employee;
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
                SourceJobPositionId = row.PositionId,
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
                        var emp = targetEmployees.Select(target => target.Employee).FirstOrDefault(e => e.Id == row.EmployeeId);
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
                            var appUrl = _urlResolver.GetFrontendBaseUrl();
                            var actionUrl = $"{appUrl}/enterprise/my-learning";
                            var htmlBody = EmailTemplateBuilder.BuildCourseAssignmentEmail(
                                emp.FullName,
                                course.Code,
                                course.Title,
                                dueDate,
                                actionUrl);

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

    private async Task<List<EffectiveJobPositions.Placement>> ResolveTargetEmployees(Guid organizationId, CreateAssignmentTargets targets)
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
        }

        var placements = EffectiveJobPositions.Resolve(_context, query);
        if (targets.EmployeeIds is not { Count: > 0 } && targets.JobPositionId.HasValue)
            placements = placements.Where(row => row.PositionId == targets.JobPositionId.Value);
        return await placements.ToListAsync();
    }
}
