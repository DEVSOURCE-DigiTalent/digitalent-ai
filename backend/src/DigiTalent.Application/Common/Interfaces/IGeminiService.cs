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
        string? domainName = null,
        int? tier = null,
        IReadOnlyList<PulseCriterionDto>? rubric = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gợi ý điểm (0–10) và nhận xét cho các bài tự luận của bài đánh giá dùng thử. Null khi chưa cấu hình khóa hoặc AI
    /// không trả lời được — không có điểm giả thay thế.
    /// </summary>
    Task<TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(
        IReadOnlyList<TrialEssayAiInput> essays,
        CancellationToken cancellationToken = default);
}

public sealed record ProctoringEventInfo(string Kind, long OffsetMs, long? DurationMs);
