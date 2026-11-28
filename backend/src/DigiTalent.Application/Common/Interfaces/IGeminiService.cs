using DigiTalent.Application.UseCases.BehaviorReports;
using DigiTalent.Application.UseCases.Learning.ContentAi;
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

    /// <summary>Returns a passage from the submission, an empty string for no matching passage, or null if the lookup failed.</summary>
    Task<string?> FindEvidencePassageAsync(
        string evidenceText, string metric, string note, CancellationToken cancellationToken = default) =>
        Task.FromResult<string?>(null);

    /// <summary>
    /// Gợi ý điểm (0–10) và nhận xét cho các bài tự luận của bài đánh giá dùng thử. Null khi chưa cấu hình khóa hoặc AI
    /// không trả lời được — không có điểm giả thay thế.
    /// </summary>
    Task<TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(
        IReadOnlyList<TrialEssayAiInput> essays,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Phân tích hành vi khi làm bài cuối khóa từ nhật ký giám sát (không có video, tên hay nội dung bài làm). Null khi AI
    /// không trả lời được — không có kết quả giả thay thế.
    /// </summary>
    Task<BehaviorAiResult?> AnalyzeExamBehaviorAsync(BehaviorAiInput input, CancellationToken cancellationToken = default) =>
        Task.FromResult<BehaviorAiResult?>(null);

    /// <summary>
    /// Drafts lesson pages and review questions for one module, following the Circular 02/2025 requirements of its
    /// competency at the course level. Null when no key is configured or the AI did not answer.
    /// </summary>
    Task<ModuleContentSuggestionOutput?> SuggestModuleContentAsync(
        ModuleContentAiRequest request, CancellationToken cancellationToken = default) =>
        Task.FromResult<ModuleContentSuggestionOutput?>(null);

    /// <summary>
    /// Checks one module's lessons and questions against those requirements (met / partial / missing per requirement,
    /// issues, question problems). Null when no key is configured or the AI did not answer — never a made-up result.
    /// </summary>
    Task<ModuleContentCheckOutput?> CheckModuleContentAsync(
        ModuleContentAiRequest request, CancellationToken cancellationToken = default) =>
        Task.FromResult<ModuleContentCheckOutput?>(null);

    /// <summary>
    /// Rewrites one page (1-based) of the module for its competency at the course level, fixing the notes given.
    /// Null when no key is configured or the AI did not answer.
    /// </summary>
    Task<RewrittenPageOutput?> RewriteModulePageAsync(
        ModuleContentAiRequest request, int pageNumber, IReadOnlyList<string> notes, CancellationToken cancellationToken = default) =>
        Task.FromResult<RewrittenPageOutput?>(null);
}

public sealed record ProctoringEventInfo(string Kind, long OffsetMs, long? DurationMs);
