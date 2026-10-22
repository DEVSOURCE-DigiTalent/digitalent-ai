using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Tests.Pulse;

internal sealed class StubGeminiService : IGeminiService
{
    public Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(PulseRules.AiHint(evidenceText));
    }
}
