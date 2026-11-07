using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;

namespace DigiTalent.Application.Common.Interfaces;

public interface IGeminiService
{
    /// <summary>Có khóa Gemini (Gemini:ApiKey, hoặc khóa trợ lý khi Assistant:Provider = Gemini, hoặc GEMINI_API_KEY).</summary>
    bool IsConfigured { get; }

    /// <param name="courseContent">Plain text of the lessons of the course version, so the answer is checked against what was taught.</param>
    Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        string? courseContent = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bản nháp gợi ý cho báo cáo dùng thử từ số liệu ẩn danh: 3 lĩnh vực ưu tiên và lý do mức tối đa từng lĩnh vực, mỗi câu
    /// ngắn. Null khi chưa cấu hình khóa hoặc AI không trả lời được. Kết quả phải qua <see cref="TrialInsightGuard"/> trước khi hiện.
    /// </summary>
    Task<TrialInsightDraft?> DraftTrialInsightsAsync(TrialInsightFacts facts, CancellationToken cancellationToken = default);
}

public sealed record ProctoringEventInfo(string Kind, long OffsetMs, long? DurationMs);
