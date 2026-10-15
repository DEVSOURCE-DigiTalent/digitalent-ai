using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/outcomes/{outcomeId} — một kết quả đã xác nhận của chính nhân viên (§12.5). Bản ghi của người
/// khác → 404.
/// </summary>
public class GetPulseOutcomeUseCase : IUseCase<GetPulseOutcomeUseCaseInput, PulseOutcomeDto>
{
    private readonly PulseLearnerReader _learner;
    private readonly PulseOutcomeReader _outcomes;

    public GetPulseOutcomeUseCase(PulseLearnerReader learner, PulseOutcomeReader outcomes)
    {
        _learner = learner;
        _outcomes = outcomes;
    }

    public async Task<PulseOutcomeDto> ExecuteAsync(GetPulseOutcomeUseCaseInput input)
    {
        var snapshot = await _learner.LoadAsync();
        var all = await _outcomes.LoadAsync(snapshot);
        return all.FirstOrDefault(o => string.Equals(o.Id, input.OutcomeId, StringComparison.OrdinalIgnoreCase))
               ?? throw new NotFoundException("Không tìm thấy kết quả đã xác nhận.");
    }
}
