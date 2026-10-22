using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.Common.Interfaces;

public interface IGeminiService
{
    Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        CancellationToken cancellationToken = default);
}
