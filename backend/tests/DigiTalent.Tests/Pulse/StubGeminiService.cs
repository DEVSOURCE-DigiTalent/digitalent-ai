using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;

namespace DigiTalent.Tests.Pulse;

/// <summary>
/// AI giả cho test: bài cuối khóa chấm bằng từ khóa; gợi ý báo cáo dùng thử theo <see cref="TrialDraft"/> (mặc định: câu hợp lệ
/// cho mọi lĩnh vực ưu tiên và mọi lĩnh vực).
/// </summary>
internal sealed class StubGeminiService : IGeminiService
{
    public const string Model = "stub";

    public bool IsConfigured { get; init; } = true;

    public Func<TrialInsightFacts, TrialInsightDraft?> TrialDraft { get; init; } = facts => new TrialInsightDraft
    {
        Priorities = TrialInsightTemplate.Eligible(facts).Select(d => new TrialInsightDraftItem(d.Number, "Học lại phần nền")).ToList(),
        CeilingReasons = facts.Domains.Select(d => new TrialInsightDraftItem(d.Number, "Trung vị theo kết quả trắc nghiệm")).ToList(),
        Model = Model,
    };

    public Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(PulseRules.AiHint(evidenceText));
    }

    public Task<TrialInsightDraft?> DraftTrialInsightsAsync(TrialInsightFacts facts, CancellationToken cancellationToken = default) =>
        Task.FromResult(IsConfigured ? TrialDraft(facts) : null);
}
