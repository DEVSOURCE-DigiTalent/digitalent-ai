using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>GET /me/pulse/outcomes — kết quả đã xác nhận của chính nhân viên (§12.5), mới nhất trước.</summary>
public class GetPulseOutcomesUseCase : IUseCase<GetPulseOutcomesUseCaseInput, GetPulseOutcomesUseCaseOutput>
{
    private readonly PulseLearnerReader _learner;
    private readonly PulseOutcomeReader _outcomes;

    public GetPulseOutcomesUseCase(PulseLearnerReader learner, PulseOutcomeReader outcomes)
    {
        _learner = learner;
        _outcomes = outcomes;
    }

    public async Task<GetPulseOutcomesUseCaseOutput> ExecuteAsync(GetPulseOutcomesUseCaseInput input)
    {
        var snapshot = await _learner.LoadAsync();
        return new GetPulseOutcomesUseCaseOutput { Items = await _outcomes.LoadAsync(snapshot) };
    }
}
