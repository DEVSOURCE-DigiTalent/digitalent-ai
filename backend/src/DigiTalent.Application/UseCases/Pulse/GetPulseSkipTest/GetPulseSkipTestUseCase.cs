using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId}/skip-test — bài kiểm tra vượt học của khóa (<see cref="PulseSkipTest"/>): trạng thái, số câu,
/// ngưỡng đạt, số lần làm còn lại, đề của lần đang làm (không kèm đáp án) và kết quả các lần đã nộp. Chỉ đọc.
/// </summary>
public class GetPulseSkipTestUseCase : IUseCase<GetPulseSkipTestUseCaseInput, GetPulseSkipTestUseCaseOutput>
{
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseSkipTest _skip;

    public GetPulseSkipTestUseCase(PulseCourseWorkspace workspace, PulseSkipTest skip)
    {
        _workspace = workspace;
        _skip = skip;
    }

    public async Task<GetPulseSkipTestUseCaseOutput> ExecuteAsync(GetPulseSkipTestUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        return await _skip.ReadAsync<GetPulseSkipTestUseCaseOutput>(snapshot, state, _workspace.Now);
    }
}
