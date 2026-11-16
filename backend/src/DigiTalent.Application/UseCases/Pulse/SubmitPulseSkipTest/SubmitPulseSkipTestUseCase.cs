using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/skip-test — nộp lần làm đang mở của bài kiểm tra vượt học (<see cref="PulseSkipTest"/>).
/// Chấm ngay trên đề rút lại từ nhân viên × khóa × lần làm; câu bỏ trống tính là sai. Đúng từ
/// <see cref="PulseRules.SkipTestPassPercent"/>% số câu (và nộp trong giờ) thì đạt: mọi mô-đun được tính là đã qua, tiến độ
/// lượt học lên 100% và bài đánh giá cuối khóa mở. Kết quả chỉ cho biết số câu đúng theo mô-đun, không lộ đáp án.
/// </summary>
public class SubmitPulseSkipTestUseCase : IUseCase<SubmitPulseSkipTestUseCaseInput, SubmitPulseSkipTestUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseSkipTest _skip;

    public SubmitPulseSkipTestUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseSkipTest skip)
    {
        _context = context;
        _workspace = workspace;
        _skip = skip;
    }

    public async Task<SubmitPulseSkipTestUseCaseOutput> ExecuteAsync(SubmitPulseSkipTestUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        if (!PulseSkipTest.CanTake(state))
        {
            throw new ForbiddenException(PulseSkipTest.MessageOf(PulseSkipTestStatus.Locked, state) ?? "Bạn chưa thể nộp bài kiểm tra đầu vào.");
        }

        var now = _workspace.Now;
        var courseId = PulseSkipTest.CourseIdOf(state);
        var attempts = await _skip.LoadAttemptsAsync(await _skip.FindAssessmentIdAsync(courseId), state.Enrollment?.Id);
        var open = attempts.LastOrDefault(a => a.Status == Statuses.AssessmentAttempt.Started)
            ?? throw new BadRequestException("Bạn chưa bắt đầu bài kiểm tra vượt học hoặc bài đã được nộp.", "attemptNo", "SKIP_TEST_NOT_STARTED");
        if (open.AttemptNo != input.AttemptNo)
        {
            throw new BadRequestException("Đề đã đổi sang lần làm khác. Hãy tải lại trang.", "attemptNo", "SKIP_TEST_CHANGED");
        }

        var pool = await _skip.LoadPoolAsync(state.Modules);
        var paper = PulseSkipTest.Draw(pool, snapshot.Employee.Id, courseId, open.AttemptNo);
        if (paper.Count == 0)
        {
            throw new BadRequestException("Ngân hàng câu hỏi của khóa đã thay đổi, không chấm được bài này.", "attemptNo", "SKIP_TEST_UNAVAILABLE");
        }

        var byQuestion = paper.ToDictionary(p => p.Question.QuestionId);
        foreach (var answer in input.Answers)
        {
            if (!byQuestion.TryGetValue(answer.QuestionId, out var item) || item.Question.Options.All(o => o.OptionId != answer.OptionId))
            {
                throw new BadRequestException("Câu trả lời không thuộc đề của lần làm này.", "answers", "SKIP_TEST_ANSWERS_INVALID");
            }
        }

        var late = PulseSkipTest.Expired(open, now);
        var selected = input.Answers.ToDictionary(a => a.QuestionId, a => a.OptionId);
        var attempt = await _context.AssessmentAttempts.FirstAsync(a => a.Id == open.Id);
        if (attempt.Status != Statuses.AssessmentAttempt.Started)
        {
            throw new ConflictException("Bài kiểm tra vượt học đã được nộp.");
        }

        var correct = 0;
        foreach (var item in paper)
        {
            Guid? optionId = selected.TryGetValue(item.Question.QuestionId, out var chosen) ? chosen : null;
            var isCorrect = optionId is { } id && item.Question.Options.First(o => o.OptionId == id).IsCorrect;
            if (isCorrect)
            {
                correct++;
            }

            _context.AssessmentAnswers.Add(new AssessmentAnswer
            {
                AttemptId = attempt.Id,
                QuestionId = item.Question.QuestionId,
                SelectedOptionId = optionId,
                IsCorrect = isCorrect,
                PointsAwarded = isCorrect ? 1 : 0,
            });
        }

        var passed = !late && correct >= PulseRules.SkipTestPassMark(paper.Count);
        attempt.Status = Statuses.AssessmentAttempt.Scored;
        attempt.SubmittedAt = now;
        attempt.ScoredAt = now;
        attempt.Score = Math.Round(correct * 100m / paper.Count, 2, MidpointRounding.AwayFromZero);
        attempt.Passed = passed;

        // Đã làm bài đầu vào: lượt học bắt đầu (chưa đạt thì học tuần tự, đạt thì mọi mô-đun tính là đã qua).
        var enrollment = await _context.Enrollments.FirstAsync(e => e.Id == attempt.EnrollmentId);
        if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt ??= now;
        }

        if (passed)
        {
            PulseCourseWorkspace.UpdateProgressPercent(enrollment, state.Modules.Count, state.Modules.Count);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_assessment_answers_attempt_question: hai lần nộp cùng lúc
            throw new ConflictException("Bài kiểm tra vượt học đang được chấm, vui lòng tải lại trang.");
        }

        var (freshSnapshot, freshState) = await _workspace.ResolveAsync(input.CourseId);
        var output = await _skip.ReadAsync<SubmitPulseSkipTestUseCaseOutput>(freshSnapshot, freshState, now);
        output.Result = output.Results.FirstOrDefault(r => r.AttemptNo == open.AttemptNo) ?? new PulseSkipTestResultDto();
        output.Result.Expired = late;
        output.FinalUnlocked = passed && freshState.AllModulesPassed;
        return output;
    }
}
