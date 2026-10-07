using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-12 — Kết quả 1 lần làm bài đã chấm (xem lại được bất kỳ lúc nào, trên mọi thiết bị).</summary>
public class GetMyAttemptResultUseCase : IUseCase<GetMyAttemptResultUseCaseInput, MyAttemptResultDto>
{
    private readonly MyEmployeeContext _me;
    private readonly MyAttemptPresenter _presenter;

    public GetMyAttemptResultUseCase(MyEmployeeContext me, MyAttemptPresenter presenter)
    {
        _me = me;
        _presenter = presenter;
    }

    public async Task<MyAttemptResultDto> ExecuteAsync(GetMyAttemptResultUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        return await _presenter.ResultAsync(employee, input.AttemptId);
    }
}
