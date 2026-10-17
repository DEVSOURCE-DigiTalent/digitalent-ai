using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId} — trang chi tiết khóa (§9.1): quyền truy cập, tiến độ, mô đun theo thứ tự,
/// tiêu chí bài cuối khóa và nút hành động theo trạng thái (bài đánh giá trước khi học đi trước khi học).
/// </summary>
public class GetPulseCourseUseCase : IUseCase<GetPulseCourseUseCaseInput, GetPulseCourseUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;

    public GetPulseCourseUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace)
    {
        _context = context;
        _workspace = workspace;
    }

    public async Task<GetPulseCourseUseCaseOutput> ExecuteAsync(GetPulseCourseUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var outcomes = await _context.CourseLearningOutcomes
            .AsNoTracking()
            .Where(o => o.CourseId == state.Course.CourseId)
            .OrderBy(o => o.SortOrder).ThenBy(o => o.Code)
            .Select(o => o.Statement)
            .ToListAsync();

        var full = state.Access != PulseCourseAccess.Preview;
        var modules = state.Modules.Select(m =>
        {
            var progress = state.Progress?.GetValueOrDefault(m.ModuleId);
            var previous = m.Index == 0 ? null : state.Modules[m.Index - 1];
            var previousPassed = previous == null
                || (state.Progress?.GetValueOrDefault(previous.ModuleId) is { } p && p.Passed(previous));
            return new PulseCourseModuleDto
            {
                ModuleId = m.ModuleId,
                Index = m.Index,
                Title = m.Title,
                Description = m.Description,
                EstimatedMinutes = m.EstimatedMinutes,
                SlideCount = m.Slides.Count,
                HasQuiz = m.QuizAssessmentId.HasValue,
                QuizQuestionCount = Math.Min(PulseRules.ModuleQuizDrawSize, m.QuizQuestionCount),
                QuizBankQuestionCount = m.QuizQuestionCount,
                Viewed = progress?.Viewed ?? false,
                Passed = progress?.Passed(m) ?? false,
                Unlocked = previousPassed,
                Viewable = full || m.Index == 0,
            };
        }).ToList();

        var firstOpen = modules.FirstOrDefault(m => !m.Passed);
        var nextAction = state.Approved ? "DONE"
            : state.BlockReason is PulseBlockReason.NoPosition or PulseBlockReason.OutsidePath or PulseBlockReason.AboveCeiling or PulseBlockReason.PriorLevelRequired ? "LOCKED"
            : state.PreStatus == PulsePreStatus.Required ? "PRE_ASSESSMENT"
            : state.PreStatus == PulsePreStatus.Pending ? "PRE_REVIEW"
            : !full ? "PREVIEW"
            : state.AllModulesPassed ? "FINAL"
            : "MODULE";

        return new GetPulseCourseUseCaseOutput
        {
            Course = PulseMapping.Course(state),
            Description = state.Course.Description,
            Purpose = state.Course.Purpose,
            EstimatedMinutes = state.Course.EstimatedMinutes,
            VersionNo = state.Course.VersionNo,
            Domain = PulseMapping.Domain(state.Domain),
            Reviewer = PulseMapping.Reviewer(snapshot),
            LearningOutcomes = outcomes,
            Modules = modules,
            FinalCriteria = PulseRules.FinalCriteria.ToList(),
            NextAction = nextAction,
            NextModuleId = nextAction == "PREVIEW" ? modules.FirstOrDefault()?.ModuleId
                : nextAction == "MODULE" ? (firstOpen ?? modules.FirstOrDefault())?.ModuleId
                : null,
        };
    }
}
