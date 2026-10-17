using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /pulse/final-reviews/pre-assessments/{preAssessmentId}/decision — người chấm ghi quyết định cho bài đánh giá
/// trước khi học đang chờ ("Đạt" cần phần trắc nghiệm đủ số câu đúng, <see cref="PulseExamPaper.BelowPass"/>):
///   - PASSED: khóa được công nhận — lượt học của mã khóa chuyển COMPLETED (tạo mới nếu chưa có, không cần suất học),
///     mức đã xác nhận có thể tăng và cấp kế tiếp mở.
///   - NOT_YET: nhân viên học khóa rồi làm bài cuối khóa như bình thường (khóa có phí vẫn cần suất học).
/// Nhân viên nhận thông báo kèm lý do. Ghi nhật ký kiểm tra sau khi lưu.
/// </summary>
public class DecidePulsePreAssessmentUseCase : IUseCase<DecidePulsePreAssessmentUseCaseInput, DecidePulsePreAssessmentUseCaseOutput>
{
    public const string NotificationType = "PULSE_PRE_ASSESSMENT_DECIDED";

    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly IAuditService _audit;
    private readonly TimeProvider _clock;

    public DecidePulsePreAssessmentUseCase(IApplicationDbContext context, PulseReviewScope scope, IAuditService audit, TimeProvider clock)
    {
        _context = context;
        _scope = scope;
        _audit = audit;
        _clock = clock;
    }

    public async Task<DecidePulsePreAssessmentUseCaseOutput> ExecuteAsync(DecidePulsePreAssessmentUseCaseInput input)
    {
        var (preAssessment, employee) = await _scope.LoadPreAssessmentAsync(input.PreAssessmentId);
        if (preAssessment.Decision != null)
        {
            throw new ConflictException("Bài đánh giá này đã có quyết định.");
        }

        PulseExamPaper.EnsureCanPass(input.Decision, preAssessment.ChoiceScore, preAssessment.ChoiceTotal);

        var now = _clock.GetUtcNow();
        var reason = input.Reason.Trim();
        preAssessment.Decision = input.Decision;
        preAssessment.DecisionReason = reason;
        preAssessment.ReviewedByUserId = _scope.ReviewerUserId;
        preAssessment.ReviewedAt = now;

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == preAssessment.CourseId)
            .Select(c => new { c.Id, c.Code, c.Title, c.OrganizationId })
            .FirstAsync();

        if (input.Decision == Statuses.FinalSubmissionDecision.Passed)
        {
            // Lượt học của mã khóa (suất đã giữ nếu có); không có thì tạo lượt đã hoàn thành.
            var enrollment = await (
                    from item in _context.Enrollments
                    join version in _context.Courses on item.CourseId equals version.Id
                    where item.EmployeeId == employee.Id
                          && version.OrganizationId == course.OrganizationId
                          && version.Code == course.Code
                          && item.Status != Statuses.Enrollment.Cancelled
                    orderby item.Status == Statuses.Enrollment.Completed ? 0 : 1, item.CreatedAt descending
                    select item)
                .FirstOrDefaultAsync();
            if (enrollment == null)
            {
                enrollment = new Enrollment
                {
                    EmployeeId = employee.Id,
                    CourseId = course.Id,
                    Status = Statuses.Enrollment.Completed,
                    ProgressPercent = 100,
                    CompletedAt = now,
                };
                _context.Enrollments.Add(enrollment);
            }
            else if (enrollment.Status != Statuses.Enrollment.Completed)
            {
                enrollment.Status = Statuses.Enrollment.Completed;
                enrollment.ProgressPercent = 100;
                enrollment.CompletedAt = enrollment.StartedAt is { } started && started > now ? started : now;
            }

            preAssessment.EnrollmentId = enrollment.Id;
        }

        if (employee.UserId is { } employeeUserId)
        {
            var passed = input.Decision == Statuses.FinalSubmissionDecision.Passed;
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = employeeUserId,
                Type = NotificationType,
                Title = passed ? "Bài đánh giá trước khi học đạt — khóa được công nhận" : "Bài đánh giá trước khi học chưa đạt — hãy học khóa",
                Message = $"{course.Title}: {reason}",
                RelatedEntityType = "course_pre_assessments",
                RelatedEntityId = preAssessment.Id,
            });
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Bài đánh giá vừa được cập nhật, vui lòng tải lại hàng chờ.");
        }

        await _audit.LogAsync(
            "PULSE_PRE_ASSESSMENT_DECIDED",
            "course_pre_assessments",
            preAssessment.Id,
            newValues: new { preAssessment.Decision, preAssessment.EnrollmentId, CourseId = course.Id, EmployeeId = employee.Id },
            entityLabel: $"{employee.FullName} · {course.Title}");

        return new DecidePulsePreAssessmentUseCaseOutput
        {
            PreAssessmentId = preAssessment.Id,
            Decision = input.Decision,
            Status = input.Decision == Statuses.FinalSubmissionDecision.Passed ? PulsePreStatus.Passed : PulsePreStatus.NotYet,
            EnrollmentId = preAssessment.EnrollmentId,
        };
    }
}
