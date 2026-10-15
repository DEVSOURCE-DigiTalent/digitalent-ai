using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /pulse/final-reviews/{submissionId}/decision — quản lý ghi quyết định cho bài cuối khóa đang chờ (§10):
///   - PASSED: lượt học COMPLETED → khóa được xác nhận, cấp khóa có thể nâng mức đã xác nhận, mở cấp kế tiếp.
///   - NOT_YET lần 1: chụp cửa sổ nộp lại theo chính sách doanh nghiệp (chờ cooldown, hạn deadline).
///   - NOT_YET lần 2: cờ cần hỗ trợ, không mở cấp tiếp.
/// Nhân viên nhận thông báo kèm lý do. Ghi nhật ký kiểm tra sau khi lưu.
/// </summary>
public class DecidePulseFinalUseCase : IUseCase<DecidePulseFinalUseCaseInput, DecidePulseFinalUseCaseOutput>
{
    public const string NotificationType = "PULSE_FINAL_DECIDED";

    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly PulseRetryPolicyProvider _policy;
    private readonly IAuditService _audit;
    private readonly TimeProvider _clock;

    public DecidePulseFinalUseCase(
        IApplicationDbContext context, PulseReviewScope scope, PulseRetryPolicyProvider policy, IAuditService audit, TimeProvider clock)
    {
        _context = context;
        _scope = scope;
        _policy = policy;
        _audit = audit;
        _clock = clock;
    }

    public async Task<DecidePulseFinalUseCaseOutput> ExecuteAsync(DecidePulseFinalUseCaseInput input)
    {
        var (submission, enrollment, employee) = await _scope.LoadAsync(input.SubmissionId);
        if (submission.Decision != null)
        {
            throw new ConflictException("Bài nộp này đã có quyết định.");
        }

        var latest = await _context.CourseFinalSubmissions
            .Where(s => s.EnrollmentId == enrollment.Id)
            .MaxAsync(s => s.AttemptNo);
        if (latest != submission.AttemptNo)
        {
            throw new ConflictException("Chỉ chấm được lần nộp mới nhất.");
        }

        var now = _clock.GetUtcNow();
        var reason = input.Reason.Trim();
        submission.Decision = input.Decision;
        submission.DecisionReason = reason;
        submission.ReviewedByUserId = _scope.ReviewerUserId;
        submission.ReviewedAt = now;

        string status;
        if (input.Decision == Statuses.FinalSubmissionDecision.Passed)
        {
            enrollment.Status = Statuses.Enrollment.Completed;
            enrollment.ProgressPercent = 100;
            enrollment.StartedAt ??= submission.SubmittedAt;
            enrollment.CompletedAt = now;
            status = PulseFinalStatus.Approved;
        }
        else if (submission.AttemptNo < PulseRules.MaxFinalAttempts)
        {
            var policy = await _policy.GetAsync(employee.OrganizationId);
            submission.RetryOpensAt = now.AddHours(policy.CooldownHours);
            submission.RetryDueAt = submission.RetryOpensAt.Value.AddDays(policy.DeadlineDays);
            enrollment.Status = Statuses.Enrollment.InProgress;
            status = PulseFinalStatus.RetryWait;
        }
        else
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            status = PulseFinalStatus.Flagged;
        }

        var courseTitle = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == enrollment.CourseId)
            .Select(c => c.Title)
            .FirstAsync();
        if (employee.UserId is { } employeeUserId)
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = employeeUserId,
                Type = NotificationType,
                Title = status switch
                {
                    PulseFinalStatus.Approved => "Bài cuối khóa đã được duyệt",
                    PulseFinalStatus.RetryWait => "Bài cuối khóa cần chỉnh sửa",
                    _ => "Bài cuối khóa cần hỗ trợ thêm",
                },
                Message = $"{courseTitle}: {reason}",
                RelatedEntityType = "course_final_submissions",
                RelatedEntityId = submission.Id,
            });
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Bài nộp vừa được cập nhật, vui lòng tải lại hàng chờ.");
        }

        await _audit.LogAsync(
            "PULSE_FINAL_DECIDED",
            "course_final_submissions",
            submission.Id,
            newValues: new { submission.Decision, submission.AttemptNo, EnrollmentId = enrollment.Id, EmployeeId = employee.Id },
            entityLabel: $"{employee.FullName} · {courseTitle}");

        return new DecidePulseFinalUseCaseOutput
        {
            SubmissionId = submission.Id,
            Decision = input.Decision,
            Status = status,
            EnrollmentStatus = enrollment.Status,
            RetryOpensAt = submission.RetryOpensAt,
            RetryDueAt = submission.RetryDueAt,
        };
    }
}
