using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId}/final — bài cuối của đúng khóa (§9.3, §10): số câu trắc nghiệm của đề, ba tiêu chí
/// phần tự luận, trạng thái nộp, nhận xét của quản lý (kèm số câu trắc nghiệm đúng khi đã chấm), cửa sổ nộp lần 2, cờ hỗ
/// trợ và việc có bắt đầu được bài làm có giám sát hay không.
/// </summary>
public class GetPulseFinalUseCase : IUseCase<GetPulseFinalUseCaseInput, GetPulseFinalUseCaseOutput>
{
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseFinalReader _final;
    private readonly PulseRetryPolicyProvider _policy;

    public GetPulseFinalUseCase(PulseCourseWorkspace workspace, PulseFinalReader final, PulseRetryPolicyProvider policy)
    {
        _workspace = workspace;
        _final = final;
        _policy = policy;
    }

    public async Task<GetPulseFinalUseCaseOutput> ExecuteAsync(GetPulseFinalUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var policy = await _policy.GetAsync(snapshot.Employee.OrganizationId);
        var firstOpen = state.Modules.FirstOrDefault(m => !(state.Progress?.GetValueOrDefault(m.ModuleId)?.Passed(m) ?? false));
        var choiceCount = PulseExamPaper.SizeOf(state.Modules);

        return new GetPulseFinalUseCaseOutput
        {
            Course = PulseMapping.Course(state),
            Domain = PulseMapping.Domain(state.Domain),
            PositionName = snapshot.PositionName,
            Reviewer = PulseMapping.Reviewer(snapshot),
            Criteria = PulseRules.FinalCriteria.ToList(),
            ChoiceCount = choiceCount,
            ChoicePassMark = PulseRules.ChoicePassMark(choiceCount),
            Status = state.FinalStatus,
            CanSubmit = state.CanStartFinal,
            ClosedMessage = state.CanStartFinal ? null
                : state.BlockReason != null ? PulseCourseWorkspace.BlockMessage(state.BlockReason)
                : PulseCourseWorkspace.FinalClosedMessage(state),
            BlockReason = state.BlockReason,
            ModulesPassed = state.ModulesPassed,
            ModuleCount = state.Modules.Count,
            FirstOpenModuleId = firstOpen?.ModuleId,
            MaxAttempts = PulseRules.MaxFinalAttempts,
            Attempts = await _final.MapAsync(state.Submissions.ToList()),
            CooldownHours = policy.CooldownHours,
            DeadlineDays = policy.DeadlineDays,
        };
    }
}
