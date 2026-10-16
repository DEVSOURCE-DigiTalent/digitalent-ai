using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/final — nộp bài cuối khóa (§9.3, §10.1) kèm phiên làm bài có giám sát đã ghi toàn
/// bộ màn hình, camera và micro. Chỉ khi đã qua mọi mô đun và bài đang mở (lần 1, hoặc lần 2 trong cửa sổ sau lần 1 chưa
/// đạt). Phần trắc nghiệm được chấm ngay (<see cref="PulseExamPaper"/>) nhưng nhân viên chỉ thấy sau khi có quyết định.
/// Lượt học chuyển READY_FOR_ASSESSMENT; người chấm (quản lý phòng ban, hoặc chủ doanh nghiệp khi nhân viên là quản lý)
/// nhận thông báo.
/// </summary>
public class SubmitPulseFinalUseCase : IUseCase<SubmitPulseFinalUseCaseInput, SubmitPulseFinalUseCaseOutput>
{
    public const string NotificationType = "PULSE_FINAL_SUBMITTED";

    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseProctoring _proctoring;
    private readonly PulseExamPaper _paper;

    public SubmitPulseFinalUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseProctoring proctoring, PulseExamPaper paper)
    {
        _context = context;
        _workspace = workspace;
        _proctoring = proctoring;
        _paper = paper;
    }

    public async Task<SubmitPulseFinalUseCaseOutput> ExecuteAsync(SubmitPulseFinalUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        PulseCourseWorkspace.EnsureCanWork(state);
        if (state.Enrollment == null || !state.AllModulesPassed)
        {
            throw new BadRequestException("Hãy đạt câu hỏi ôn tập của tất cả mô đun trước khi nộp bài cuối khóa.", "courseId", "MODULES_INCOMPLETE");
        }

        if (!PulseRules.CanSubmitFinal(state.FinalStatus))
        {
            throw new ConflictException(PulseCourseWorkspace.FinalClosedMessage(state));
        }

        var now = _workspace.Now;
        var session = await _proctoring.CloseForSubmitAsync(
            input.ProctoringSessionId, snapshot.Employee.Id, Statuses.ProctoringKind.Final, state.Enrollment.CourseId, now);
        var attemptNo = (short)(state.Submissions.Count + 1);
        var paper = await _paper.DrawAsync(
            state.Modules, snapshot.Employee.Id, state.Enrollment.CourseId, PulseExamPaper.SlotOf(Statuses.ProctoringKind.Final, attemptNo));
        var grade = PulseExamPaper.Grade(paper, input.Answers);
        var submission = new CourseFinalSubmission
        {
            EnrollmentId = state.Enrollment.Id,
            ProctoringSessionId = session.Id,
            AttemptNo = attemptNo,
            EvidenceText = input.EvidenceText.Trim(),
            ChoiceScore = grade?.Score,
            ChoiceTotal = grade?.Total,
            SubmittedAt = now,
        };
        _context.CourseFinalSubmissions.Add(submission);
        foreach (var answer in grade?.Answers ?? Array.Empty<ExamChoiceAnswer>())
        {
            answer.FinalSubmissionId = submission.Id;
            _context.ExamChoiceAnswers.Add(answer);
        }

        var enrollment = await _context.Enrollments.FirstAsync(e => e.Id == state.Enrollment.Id);
        enrollment.Status = Statuses.Enrollment.ReadyForAssessment;
        enrollment.StartedAt ??= now;

        foreach (var reviewerUserId in await PulseReviewers.UserIdsAsync(_context, snapshot.Employee))
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = reviewerUserId,
                Type = NotificationType,
                Title = "Có bài cuối khóa cần chấm",
                Message = $"{snapshot.Employee.FullName} đã nộp bài cuối khóa \"{state.Course.Title}\" (lần {attemptNo}/{PulseRules.MaxFinalAttempts}).",
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
            // uq_course_final_submissions_enrollment_attempt: bấm "Nộp" hai lần cùng lúc
            throw new ConflictException("Bài cuối khóa đang được gửi, vui lòng tải lại trang.");
        }

        return new SubmitPulseFinalUseCaseOutput
        {
            SubmissionId = submission.Id,
            AttemptNo = attemptNo,
            SubmittedAt = now,
            DurationMs = session.DurationMs ?? 0,
        };
    }
}
