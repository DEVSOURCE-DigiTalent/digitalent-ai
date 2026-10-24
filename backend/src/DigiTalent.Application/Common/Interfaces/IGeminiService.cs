using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.Common.Interfaces;

public interface IGeminiService
{
    Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        CancellationToken cancellationToken = default);
}

public sealed record ProctoringEventInfo(string Kind, long OffsetMs, long? DurationMs);
