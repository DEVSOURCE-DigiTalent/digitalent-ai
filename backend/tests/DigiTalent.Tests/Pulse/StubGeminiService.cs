using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;

namespace DigiTalent.Tests.Pulse;

/// <summary>AI giả cho test: bài cuối khóa chấm bằng từ khóa; tự luận dùng thử cho mọi bài <see cref="EssayScore"/> điểm.</summary>
internal sealed class StubGeminiService : IGeminiService
{
    public bool IsConfigured { get; init; } = true;

    public int EssayScore { get; init; } = 7;

    public Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(PulseRules.AiHint(evidenceText));
    }

    public Task<TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(
        IReadOnlyList<TrialEssayAiInput> essays,
        CancellationToken cancellationToken = default)
    {
        TrialEssayAiReviewDto? review = !IsConfigured ? null : new TrialEssayAiReviewDto
        {
            Essays = essays.Select(e => new TrialEssayAiScoreDto
            {
                Tier = e.Tier,
                Score = EssayScore,
                Passed = EssayScore >= TrialProgramRules.EssayPassScore,
                Feedback = "Bài có công cụ và các bước cụ thể.",
            }).ToList(),
            Summary = "Bài làm rõ ràng.",
            Model = "stub",
        };
        return Task.FromResult(review);
    }
}
