using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Content;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId}/modules/{moduleId} — trang học mô đun (§9.2): các trang nội dung theo thứ tự và
/// bộ câu ôn tập của lần làm kế tiếp (không kèm đáp án). Sau lần chưa đạt, câu hỏi chỉ hiện lại khi đã mở lại các trang
/// liên quan. Khóa có phí chưa có suất chỉ xem trang đầu tiên của mô đun 1 (§8).
/// </summary>
public class GetPulseModuleUseCase : IUseCase<GetPulseModuleUseCaseInput, GetPulseModuleUseCaseOutput>
{
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseQuizReader _quiz;
    private readonly LearningContentReader? _content;

    public GetPulseModuleUseCase(PulseCourseWorkspace workspace, PulseQuizReader quiz, IApplicationDbContext? context = null, IPlatformAssetUrlSigner? urls = null)
    {
        _workspace = workspace;
        _quiz = quiz;
        _content = context == null ? null : new LearningContentReader(context, urls);
    }

    public async Task<GetPulseModuleUseCaseOutput> ExecuteAsync(GetPulseModuleUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var module = PulseCourseWorkspace.FindModule(state, input.ModuleId);
        var sample = state.Access == PulseCourseAccess.Preview;
        if (sample && module.Index > 0)
        {
            throw new ForbiddenException(PulseCourseWorkspace.BlockMessage(PulseBlockReason.SeatRequired));
        }

        var slides = sample ? module.Slides.Take(1).ToList() : module.Slides.ToList();
        var content = await _quiz.LoadSlideContentAsync(slides.Select(s => s.LessonId).ToList());
        var media = _content == null ? new Dictionary<Guid, List<LessonMediaDto>>() : await _content.MediaAsync(slides.Select(s => s.LessonId).ToList());
        var progress = state.Progress?.GetValueOrDefault(module.ModuleId);
        var previous = module.Index == 0 ? null : state.Modules[module.Index - 1];
        var previousPassed = previous == null || (state.Progress?.GetValueOrDefault(previous.ModuleId) is { } p && p.Passed(previous));

        var quizBlock = state.BlockReason
                        ?? (previousPassed ? null : PulseBlockReason.PreviousModuleRequired);
        PulseQuizDto? quiz = null;
        PulseQuizReviewDto? review = null;
        if (!sample && quizBlock == null && module.QuizAssessmentId is { } assessmentId)
        {
            var pool = await _quiz.LoadQuestionsAsync(assessmentId);
            review = state.Enrollment != null ? await _quiz.ReviewAsync(state.Enrollment.Id, module, pool) : null;
            var attemptNo = await _quiz.NextAttemptNoAsync(assessmentId, state.Enrollment?.Id);
            var questions = PulseQuizReader.Draw(pool, snapshot.Employee.Id, assessmentId, attemptNo);
            quiz = review is { Done: false } ? null : new PulseQuizDto
            {
                AssessmentId = assessmentId,
                AttemptNo = attemptNo,
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
                QuizBankQuestionCount = module.QuizQuestionCount,
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
                Media = media.GetValueOrDefault(s.LessonId) ?? new(),
            }).ToList(),
            Viewed = progress?.Viewed ?? false,
            QuizPassed = progress?.QuizPassed ?? false,
            LastQuiz = lastQuiz,
            Quiz = quiz,
            Review = review,
            QuizBlockReason = sample ? PulseBlockReason.SeatRequired : quizBlock ?? (review is { Done: false } ? PulseBlockReason.ReviewRequired : null),
            NextModuleId = module.Index + 1 < state.Modules.Count ? state.Modules[module.Index + 1].ModuleId : null,
            AllModulesPassed = state.AllModulesPassed,
        };
    }
}
