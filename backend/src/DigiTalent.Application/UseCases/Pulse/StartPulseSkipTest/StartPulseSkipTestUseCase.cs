using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/skip-test/start — bắt đầu bài kiểm tra đầu vào (<see cref="PulseSkipTest"/>): mở lượt học
/// NOT_STARTED khi chưa có (bài đầu vào bắt buộc trước khi học, nên chưa tính là bắt đầu học), tạo bài kiểm tra của khóa khi
/// chưa có, ghi lần làm STARTED (giờ bắt đầu tính hạn nộp) và trả đề.
/// Gọi lại khi đang làm trả về đúng lần đang mở. Lần làm đang mở đã quá giờ được khép lại là chưa đạt (vẫn tính một lần làm).
/// </summary>
public class StartPulseSkipTestUseCase : IUseCase<StartPulseSkipTestUseCaseInput, StartPulseSkipTestUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseSkipTest _skip;

    public StartPulseSkipTestUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseSkipTest skip)
    {
        _context = context;
        _workspace = workspace;
        _skip = skip;
    }

    public async Task<StartPulseSkipTestUseCaseOutput> ExecuteAsync(StartPulseSkipTestUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveForAnswerAsync(input.CourseId);
        var now = _workspace.Now;
        var courseId = PulseSkipTest.CourseIdOf(state);
        var pool = await _skip.LoadPoolAsync(state.Modules);
        var attempts = await _skip.LoadAttemptsAsync(await _skip.FindAssessmentIdAsync(courseId), state.Enrollment?.Id);
        var status = PulseSkipTest.StatusOf(state, PulseSkipTest.SizeOf(pool), attempts, now);
        if (status == PulseSkipTestStatus.InProgress)
        {
            return await _skip.ReadAsync<StartPulseSkipTestUseCaseOutput>(snapshot, state, now);
        }

        if (status != PulseSkipTestStatus.Available)
        {
            throw new BadRequestException(
                PulseSkipTest.MessageOf(status, state) ?? "Bài kiểm tra vượt học chưa mở.",
                "courseId",
                $"SKIP_TEST_{status}");
        }

        var enrollment = state.Enrollment;
        if (enrollment == null)
        {
            enrollment = new Enrollment
            {
                EmployeeId = snapshot.Employee.Id,
                CourseId = state.Course.CourseId,
                Status = Statuses.Enrollment.NotStarted,
                ProgressPercent = 0,
            };
            _context.Enrollments.Add(enrollment);
        }

        await CloseExpiredAsync(attempts, pool, snapshot.Employee.Id, courseId, now);

        var assessmentId = await _skip.EnsureAssessmentAsync(courseId, now);
        _context.AssessmentAttempts.Add(new AssessmentAttempt
        {
            AssessmentId = assessmentId,
            EnrollmentId = enrollment.Id,
            AttemptNo = (attempts.Count == 0 ? 0 : attempts.Max(a => a.AttemptNo)) + 1,
            Status = Statuses.AssessmentAttempt.Started,
            StartedAt = now,
        });

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_assessment_attempts_assessment_enrollment_attempt / uq_assessments_course_code_version: hai lần bấm cùng lúc
            throw new ConflictException("Bài kiểm tra vượt học đang được mở ở nơi khác, vui lòng tải lại trang.");
        }

        var (freshSnapshot, freshState) = await _workspace.ResolveAsync(input.CourseId);
        return await _skip.ReadAsync<StartPulseSkipTestUseCaseOutput>(freshSnapshot, freshState, now);
    }

    /// <summary>Khép các lần làm bỏ dở quá giờ: chưa đạt, mọi câu của đề tính là bỏ trống.</summary>
    private async Task CloseExpiredAsync(
        IReadOnlyList<PulseSkipAttemptRow> attempts,
        IReadOnlyList<PulseSkipPoolQuestion> pool,
        Guid employeeId,
        Guid courseId,
        DateTimeOffset now)
    {
        foreach (var row in attempts.Where(a => PulseSkipTest.Expired(a, now)))
        {
            var attempt = await _context.AssessmentAttempts.FirstAsync(a => a.Id == row.Id);
            attempt.Status = Statuses.AssessmentAttempt.Scored;
            attempt.SubmittedAt = now;
            attempt.ScoredAt = now;
            attempt.Score = 0;
            attempt.Passed = false;
            foreach (var item in PulseSkipTest.Draw(pool, employeeId, courseId, row.AttemptNo))
            {
                _context.AssessmentAnswers.Add(new AssessmentAnswer
                {
                    AttemptId = attempt.Id,
                    QuestionId = item.Question.QuestionId,
                    IsCorrect = false,
                    PointsAwarded = 0,
                });
            }
        }
    }
}
