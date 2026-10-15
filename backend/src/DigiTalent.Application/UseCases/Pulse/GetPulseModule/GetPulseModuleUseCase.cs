using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId}/modules/{moduleId} — trang học mô đun (§9.2): các trang nội dung theo thứ tự và
/// câu hỏi ôn tập (không kèm đáp án). Khóa có phí chưa có suất chỉ xem trang đầu tiên của mô đun 1 (§8).
/// </summary>
public class GetPulseModuleUseCase : IUseCase<GetPulseModuleUseCaseInput, GetPulseModuleUseCaseOutput>
{
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseQuizReader _quiz;

    public GetPulseModuleUseCase(PulseCourseWorkspace workspace, PulseQuizReader quiz)
    {
        _workspace = workspace;
        _quiz = quiz;
    }

    public async Task<GetPulseModuleUseCaseOutput> ExecuteAsync(GetPulseModuleUseCaseInput input)
    {
        var (_, state) = await _workspace.ResolveAsync(input.CourseId);
        var module = PulseCourseWorkspace.FindModule(state, input.ModuleId);
        var sample = state.Access == PulseCourseAccess.Preview;
        if (sample && module.Index > 0)
        {
            throw new ForbiddenException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.SeatRequired));
        }

        var slides = sample ? module.Slides.Take(1).ToList() : module.Slides.ToList();
        var content = await _quiz.LoadSlideContentAsync(slides.Select(s => s.LessonId).ToList());
        var progress = state.Progress?.GetValueOrDefault(module.ModuleId);
        var previous = module.Index == 0 ? null : state.Modules[module.Index - 1];
        var previousPassed = previous == null || (state.Progress?.GetValueOrDefault(previous.ModuleId) is { } p && p.Passed(previous));

        var quizBlock = state.BlockReason
                        ?? (previousPassed ? null : PulseBlockReason.PreviousModuleRequired);
        PulseQuizDto? quiz = null;
        if (!sample && quizBlock == null && module.QuizAssessmentId is { } assessmentId)
        {
            var questions = await _quiz.LoadQuestionsAsync(assessmentId);
            quiz = new PulseQuizDto
            {
                AssessmentId = assessmentId,
                Questions = questions.Select(q => new PulseQuizQuestionDto
                {
                    QuestionId = q.QuestionId,
                    Content = q.Content,
                    Options = q.Options.Select(o => new PulseOptionDto { OptionId = o.OptionId, Content = o.Content }).ToList(),
                }).ToList(),
            };
        }

        var lastQuiz = state.Enrollment != null && module.QuizAssessmentId is { } quizId
            ? await _quiz.LastResultAsync(state.Enrollment.Id, quizId)
            : null;

        return new GetPulseModuleUseCaseOutput
        {
            Course = PulseMapping.Course(state),
            Module = new PulseModuleDetailDto
            {
                ModuleId = module.ModuleId,
                Index = module.Index,
                Title = module.Title,
                Description = module.Description,
                EstimatedMinutes = module.EstimatedMinutes,
            },
            Modules = state.Modules.Select(m => new PulseModuleNavDto
            {
                ModuleId = m.ModuleId,
                Index = m.Index,
                Title = m.Title,
                Passed = state.Progress?.GetValueOrDefault(m.ModuleId)?.Passed(m) ?? false,
                Viewable = !sample || m.Index == 0,
            }).ToList(),
            Sample = sample,
            Slides = slides.Select(s => new PulseSlideDto
            {
                LessonId = s.LessonId,
                Title = s.Title,
                LessonType = s.LessonType,
                ContentBody = content.GetValueOrDefault(s.LessonId),
                EstimatedMinutes = s.EstimatedMinutes,
            }).ToList(),
            Viewed = progress?.Viewed ?? false,
            QuizPassed = progress?.QuizPassed ?? false,
            LastQuiz = lastQuiz,
            Quiz = quiz,
            QuizBlockReason = sample ? PulseBlockReason.SeatRequired : quizBlock,
            NextModuleId = module.Index + 1 < state.Modules.Count ? state.Modules[module.Index + 1].ModuleId : null,
            AllModulesPassed = state.AllModulesPassed,
        };
    }
}
