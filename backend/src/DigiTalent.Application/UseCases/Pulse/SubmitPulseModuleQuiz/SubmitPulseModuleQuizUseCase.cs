using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/modules/{moduleId}/quiz — câu hỏi ôn tập mô đun (§9.2). Chỉ mở khi đã đọc hết
/// trang và mô đun trước đã qua. Mỗi lần làm là một bộ câu rút từ ngân hàng của mô đun (<see cref="PulseQuizReader.Draw"/>);
/// phải đúng tất cả câu để qua. Chưa đạt thì chỉ báo câu nào sai và trang liên quan (không lộ đáp án); phải mở lại các
/// trang đó mới được làm lần tiếp theo, với câu khác. Mỗi lần làm lưu thành một assessment_attempt đã chấm.
/// </summary>
public class SubmitPulseModuleQuizUseCase : IUseCase<SubmitPulseModuleQuizUseCaseInput, SubmitPulseModuleQuizUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseQuizReader _quiz;

    public SubmitPulseModuleQuizUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseQuizReader quiz)
    {
        _context = context;
        _workspace = workspace;
        _quiz = quiz;
    }

    public async Task<SubmitPulseModuleQuizUseCaseOutput> ExecuteAsync(SubmitPulseModuleQuizUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var module = PulseCourseWorkspace.FindModule(state, input.ModuleId);
        var assessmentId = module.QuizAssessmentId
            ?? throw new BadRequestException("Mô đun này không có câu hỏi ôn tập.", "moduleId", "NO_QUIZ");

        PulseCourseWorkspace.EnsureCanWork(state);
        var previous = module.Index == 0 ? null : state.Modules[module.Index - 1];
        if (previous != null && !(state.Progress?.GetValueOrDefault(previous.ModuleId)?.Passed(previous) ?? false))
        {
            throw new ForbiddenException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.PreviousModuleRequired));
        }

        if (!(state.Progress?.GetValueOrDefault(module.ModuleId)?.Viewed ?? false))
        {
            throw new BadRequestException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.SlidesNotViewed), "moduleId", PulseBlockReason.SlidesNotViewed);
        }

        var pool = await _quiz.LoadQuestionsAsync(assessmentId);
        if (state.Enrollment != null
            && await _quiz.ReviewAsync(state.Enrollment.Id, module, pool) is { Done: false })
        {
            throw new BadRequestException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.ReviewRequired), "moduleId", PulseBlockReason.ReviewRequired);
        }

        var attemptNo = await _quiz.NextAttemptNoAsync(assessmentId, state.Enrollment?.Id);
        var questions = PulseQuizReader.Draw(pool, snapshot.Employee.Id, assessmentId, attemptNo);
        var answers = input.Answers.ToDictionary(a => a.QuestionId, a => a.OptionId);
        if (questions.Count == 0 || answers.Count != questions.Count || questions.Any(q => !answers.ContainsKey(q.QuestionId)))
        {
            if (input.AttemptNo is { } shown && shown != attemptNo)
            {
                throw new BadRequestException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.QuizChanged), "answers", PulseBlockReason.QuizChanged);
            }

            throw new BadRequestException("Hãy trả lời đủ các câu hỏi ôn tập.", "answers", "INCOMPLETE_ANSWERS");
        }

        var enrollment = await _workspace.EnsureEnrollmentAsync(snapshot, state);
        var now = _workspace.Now;

        var attempt = new AssessmentAttempt
        {
            AssessmentId = assessmentId,
            EnrollmentId = enrollment.Id,
            AttemptNo = attemptNo,
            Status = Statuses.AssessmentAttempt.Scored,
            StartedAt = now,
            SubmittedAt = now,
            ScoredAt = now,
        };
        _context.AssessmentAttempts.Add(attempt);

        var wrongIds = new List<Guid>();
        var score = 0;
        foreach (var question in questions)
        {
            var optionId = answers[question.QuestionId];
            var option = question.Options.FirstOrDefault(o => o.OptionId == optionId)
                ?? throw new BadRequestException("Phương án trả lời không thuộc câu hỏi.", "answers", "INVALID_OPTION");
            if (option.IsCorrect)
            {
                score++;
            }
            else
            {
                wrongIds.Add(question.QuestionId);
            }

            _context.AssessmentAnswers.Add(new AssessmentAnswer
            {
                AttemptId = attempt.Id,
                QuestionId = question.QuestionId,
                SelectedOptionId = optionId,
                IsCorrect = option.IsCorrect,
                PointsAwarded = option.IsCorrect ? 1 : 0,
            });
        }

        var passed = score == questions.Count;
        attempt.Score = Math.Round(score * 100m / questions.Count, 2, MidpointRounding.AwayFromZero);
        attempt.Passed = passed;

        var alreadyPassed = state.Progress?.GetValueOrDefault(module.ModuleId)?.QuizPassed ?? false;
        var modulePassed = passed || alreadyPassed;
        var passedCount = state.Modules.Count(m => m.ModuleId == module.ModuleId
            ? modulePassed
            : state.Progress?.GetValueOrDefault(m.ModuleId)?.Passed(m) ?? false);
        PulseCourseWorkspace.UpdateProgressPercent(enrollment, passedCount, state.Modules.Count);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_assessment_attempts_assessment_enrollment_attempt: hai lần bấm cùng lúc
            throw new ConflictException("Bài ôn tập đang được chấm, vui lòng tải lại trang.");
        }

        var sortOrders = pool.ToDictionary(q => q.QuestionId, q => q.SortOrder);
        var wrong = wrongIds.Select(id =>
        {
            var page = PulseRules.QuizPageIndex(sortOrders[id], module.Slides.Count);
            var slide = page >= 0 ? module.Slides[page] : null;
            return new PulseWrongAnswerDto { QuestionId = id, LessonId = slide?.LessonId, PageIndex = slide == null ? null : page, PageTitle = slide?.Title };
        }).ToList();
        var reviewPages = modulePassed ? new List<PulseQuizReviewPageDto>() : PulseQuizReader.ReviewPages(module, pool, wrongIds);

        return new SubmitPulseModuleQuizUseCaseOutput
        {
            Score = score,
            Total = questions.Count,
            Passed = passed,
            Wrong = wrong,
            Review = reviewPages.Count == 0 ? null : new PulseQuizReviewDto { AttemptNo = attemptNo, FailedAt = now, Pages = reviewPages, Done = false },
            ModulePassed = modulePassed,
            NextModuleId = module.Index + 1 < state.Modules.Count ? state.Modules[module.Index + 1].ModuleId : null,
            AllModulesPassed = state.Modules.Count > 0 && passedCount == state.Modules.Count,
        };
    }
}
