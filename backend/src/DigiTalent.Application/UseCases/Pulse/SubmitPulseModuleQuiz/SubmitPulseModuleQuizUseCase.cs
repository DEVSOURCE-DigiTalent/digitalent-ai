using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/modules/{moduleId}/quiz — câu hỏi ôn tập mô đun (§9.2). Chỉ mở khi đã đọc hết
/// trang và mô đun trước đã qua. Phải đúng tất cả câu (2/2) để qua mô đun; sai thì trả lý do và cho làm lại.
/// Mỗi lần làm lưu thành một assessment_attempt đã chấm.
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

        var questions = await _quiz.LoadQuestionsAsync(assessmentId);
        var answers = input.Answers.ToDictionary(a => a.QuestionId, a => a.OptionId);
        if (questions.Count == 0 || answers.Count != questions.Count || questions.Any(q => !answers.ContainsKey(q.QuestionId)))
        {
            throw new BadRequestException("Hãy trả lời đủ các câu hỏi ôn tập.", "answers", "INCOMPLETE_ANSWERS");
        }

        var enrollment = await _workspace.EnsureEnrollmentAsync(snapshot, state);
        var now = _workspace.Now;
        var lastNo = await _context.AssessmentAttempts
            .Where(a => a.AssessmentId == assessmentId && a.EnrollmentId == enrollment.Id)
            .MaxAsync(a => (int?)a.AttemptNo) ?? 0;

        var attempt = new AssessmentAttempt
        {
            AssessmentId = assessmentId,
            EnrollmentId = enrollment.Id,
            AttemptNo = lastNo + 1,
            Status = Statuses.AssessmentAttempt.Scored,
            StartedAt = now,
            SubmittedAt = now,
            ScoredAt = now,
        };
        _context.AssessmentAttempts.Add(attempt);

        var wrong = new List<PulseWrongAnswerDto>();
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
                wrong.Add(new PulseWrongAnswerDto { QuestionId = question.QuestionId, Explanation = question.Explanation });
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

        return new SubmitPulseModuleQuizUseCaseOutput
        {
            Score = score,
            Total = questions.Count,
            Passed = passed,
            Wrong = wrong,
            ModulePassed = modulePassed,
            NextModuleId = module.Index + 1 < state.Modules.Count ? state.Modules[module.Index + 1].ModuleId : null,
            AllModulesPassed = state.Modules.Count > 0 && passedCount == state.Modules.Count,
        };
    }
}
