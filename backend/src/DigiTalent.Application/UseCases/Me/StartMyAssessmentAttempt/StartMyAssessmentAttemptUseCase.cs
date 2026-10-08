using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-11 — Bắt đầu làm bài: đang có lần làm STARTED còn giờ → tiếp tục đúng lần đó (đổi thiết bị / mất kết nối);
/// hết giờ → chấm tự động rồi xét lần mới. Kiểm tra bài FINAL đã mở khóa và số lần làm TRƯỚC khi tạo lần mới.
/// Deadline = StartedAt (giờ server) + time_limit.
/// </summary>
public class StartMyAssessmentAttemptUseCase : IUseCase<StartMyAssessmentAttemptUseCaseInput, MyAttemptSessionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;
    private readonly MyAttemptPresenter _presenter;

    public StartMyAssessmentAttemptUseCase(
        IApplicationDbContext context, MyEmployeeContext me, MyAssessmentService assessments, MyAttemptPresenter presenter)
    {
        _context = context;
        _me = me;
        _assessments = assessments;
        _presenter = presenter;
    }

    public async Task<MyAttemptSessionDto> ExecuteAsync(StartMyAssessmentAttemptUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        var visible = await _assessments.GetVisibleAsync(employee, input.AssessmentId);
        var state = (await _assessments.BuildStatesAsync(new[] { visible }, now)).Single();

        if (state.InProgress != null)
        {
            if (!state.InProgressExpired)
            {
                return await _presenter.SessionAsync(state.InProgress, visible.Assessment, visible.Course, now);
            }

            await FinalizeExpiredAsync(employee, state.InProgress.Id, now);
            state = (await _assessments.BuildStatesAsync(new[] { visible }, now)).Single();
        }

        if (visible.QuestionCount == 0)
        {
            throw new ConflictException("Bài đánh giá chưa có câu hỏi.");
        }

        if (state.Passed && visible.Assessment.IsFinal)
        {
            throw new ConflictException("Bạn đã đạt bài đánh giá cuối khóa này.");
        }

        if (state.Status == MyAssessmentStatus.Locked)
        {
            throw new ConflictException(state.LockedReason ?? MyAssessmentService.FinalLockedReason);
        }

        if (state.AttemptsRemaining == 0)
        {
            throw new ConflictException(MyAssessmentService.NoAttemptsLeftMessage);
        }

        var attempt = new AssessmentAttempt
        {
            AssessmentId = visible.Assessment.Id,
            EnrollmentId = visible.Enrollment.Id,
            AttemptNo = state.Attempts.Count == 0 ? 1 : state.Attempts.Max(a => a.AttemptNo) + 1,
            Status = Statuses.AssessmentAttempt.Started,
            StartedAt = now,
        };
        _context.AssessmentAttempts.Add(attempt);

        var enrollment = await _context.Enrollments.FirstAsync(e => e.Id == visible.Enrollment.Id);
        if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt ??= now;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_assessment_attempts_assessment_enrollment_attempt: 2 lần bấm "Bắt đầu" cùng lúc
            throw new ConflictException("Lần làm bài đang được tạo, vui lòng tải lại trang.");
        }

        return await _presenter.SessionAsync(attempt, visible.Assessment, visible.Course, now);
    }

    private async Task FinalizeExpiredAsync(Employee employee, Guid attemptId, DateTimeOffset now)
    {
        await _context.ExecuteInTransactionAsync(async () =>
        {
            var (attempt, assessment, course, enrollment) = await _presenter.GetMyAttemptAsync(employee, attemptId, track: true);
            await _assessments.FinalizeAsync(employee, course, assessment, enrollment, attempt, submittedAnswers: null, now);
        });
    }
}
