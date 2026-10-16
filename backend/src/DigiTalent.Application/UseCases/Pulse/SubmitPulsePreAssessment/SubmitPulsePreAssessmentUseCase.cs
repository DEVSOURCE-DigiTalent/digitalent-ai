using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/pre-assessment — nộp bài đánh giá trước khi học (một bài cho mỗi khóa), kèm phiên
/// làm bài có giám sát đã ghi toàn bộ màn hình, camera và micro. Phiên được đóng; người chấm (quản lý phòng ban, hoặc
/// chủ doanh nghiệp khi nhân viên là quản lý) nhận thông báo.
/// </summary>
public class SubmitPulsePreAssessmentUseCase : IUseCase<SubmitPulsePreAssessmentUseCaseInput, SubmitPulsePreAssessmentUseCaseOutput>
{
    public const string NotificationType = "PULSE_PRE_ASSESSMENT_SUBMITTED";
    public const string NotOpen = "PRE_ASSESSMENT_NOT_OPEN";

    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseProctoring _proctoring;

    public SubmitPulsePreAssessmentUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseProctoring proctoring)
    {
        _context = context;
        _workspace = workspace;
        _proctoring = proctoring;
    }

    public async Task<SubmitPulsePreAssessmentUseCaseOutput> ExecuteAsync(SubmitPulsePreAssessmentUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        if (!state.CanStartPreAssessment)
        {
            throw new BadRequestException(PulseCourseWorkspace.PreAssessmentClosedMessage(state), "courseId", NotOpen);
        }

        var now = _workspace.Now;
        var session = await _proctoring.CloseForSubmitAsync(
            input.ProctoringSessionId, snapshot.Employee.Id, Statuses.ProctoringKind.PreAssessment, state.Course.CourseId, now);
        var preAssessment = new CoursePreAssessment
        {
            EmployeeId = snapshot.Employee.Id,
            CourseId = state.Course.CourseId,
            ProctoringSessionId = session.Id,
            EvidenceText = input.EvidenceText.Trim(),
            SubmittedAt = now,
        };
        _context.CoursePreAssessments.Add(preAssessment);

        foreach (var reviewerUserId in await PulseReviewers.UserIdsAsync(_context, snapshot.Employee))
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = reviewerUserId,
                Type = NotificationType,
                Title = "Có bài đánh giá trước khi học cần chấm",
                Message = $"{snapshot.Employee.FullName} đã nộp bài đánh giá trước khi học khóa \"{state.Course.Title}\".",
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
            // uq_course_pre_assessments_employee_course: bấm "Nộp" hai lần cùng lúc
            throw new ConflictException("Bài đánh giá trước khi học đang được gửi, vui lòng tải lại trang.");
        }

        return new SubmitPulsePreAssessmentUseCaseOutput
        {
            PreAssessmentId = preAssessment.Id,
            SubmittedAt = now,
            DurationMs = session.DurationMs ?? 0,
        };
    }
}
