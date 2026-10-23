using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.AI;

public sealed class GeminiService : IGeminiService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(HttpClient http, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = http;
        _apiKey = config["Gemini:ApiKey"] ?? "";
        _model = config["Gemini:Model"] ?? "gemini-3.8-flash";
        _logger = logger;
    }

    public async Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("Gemini API key not configured, falling back to keyword matching.");
            return PulseRules.AiHint(evidenceText);
        }

        var criteriaList = string.Join("\n", criteria.Select((c, i) => (i + 1) + ". " + c));

        // Phần events giám sát (nếu có)
        var eventsText = "";
        if (proctoringEvents != null && proctoringEvents.Count > 0)
        {
            var lines = proctoringEvents.Select(e =>
            {
                var time = FormatMs(e.OffsetMs);
                var duration = e.DurationMs.HasValue ? " (" + e.DurationMs.Value / 1000 + " giây)" : "";
                return time + " - " + e.Kind + duration;
            });
            eventsText = "\n\nSỰ KIỆN GIÁM SÁT (proctoring events - ghi lại hành vi nhân viên khi làm bài):\n"
                + string.Join("\n", lines) + "\n"
                + "Giải thích: TAB_HIDDEN=rời tab bài làm, FOCUS_LOST=chuyển cửa sổ khác, "
                + "CAMERA_STOPPED=tắt camera, MIC_STOPPED=tắt micro, "
                + "SHARE_STOPPED=dừng chia sẻ màn hình, STARTED=bắt đầu, SUBMITTED=nộp bài.";
        }

        var prompt =
            "Bạn là hệ thống AI đánh giá bài cuối khóa năng lực số cho doanh nghiệp. "
            + "Phân tích bài nộp của nhân viên và trả lời JSON thuần (không markdown).\n\n"
            + "ĐỀ BÀI:\n" + StripHtml(finalPrompt) + "\n\n"
            + "TIÊU CHÍ CHẤM (" + criteria.Count + " tiêu chí):\n" + criteriaList + "\n\n"
            + "BÀI NỘP CỦA NHÂN VIÊN:\n" + evidenceText
            + eventsText + "\n\n"
            + "YÊU CẦU ĐÁNH GIÁ:\n"
            + "1. checks: đánh giá từng tiêu chí (true/false)\n"
            + "2. summary: tóm tắt tổng quan 2-3 câu\n"
            + "3. detail: phân tích chi tiết gồm:\n"
            + "   - plagiarism_score (0-100): 0=nguyên bản, 100=sao chép hoàn toàn\n"
            + "   - plagiarism_note: giải thích ngắn gọn\n"
            + "   - ai_generated_score (0-100): 0=con người viết, 100=AI viết hoàn toàn\n"
            + "   - ai_generated_note: giải thích ngắn gọn\n"
            + "   - relevance_score (0-100): 0=lạc đề, 100=hoàn toàn đúng\n"
            + "   - relevance_note: giải thích ngắn gọn\n"
            + "   - depth_score (0-100): 0=sơ sài, 100=rất chi tiết\n"
            + "   - depth_note: giải thích ngắn gọn\n"
            + "   - clarity_score (0-100): 0=khó hiểu, 100=rất rõ ràng\n"
            + "   - clarity_note: giải thích ngắn gọn\n"
            + "   - verdict: kết luận tổng thể 1 câu\n"
            + "4. fraud: phân tích gian lận từ sự kiện giám sát (nếu có events):\n"
            + "   - level: mức nghi ngờ (LOW/MEDIUM/HIGH)\n"
            + "   - summary: tóm tắt 1 câu về tình trạng gian lận\n"
            + "   - items: danh sách sự kiện nghi ngờ, mỗi item gồm:\n"
            + "     - time: thời điểm (mm:ss)\n"
            + "     - event: loại sự kiện (Rời tab, Tắt camera...)\n"
            + "     - note: giải thích vì sao nghi ngờ\n"
            + "   Nếu không có events hoặc không có gì bất thường, trả fraud.level=LOW, items=[]\n\n"
            + "Trả JSON theo cấu trúc:\n"
            + "{\"checks\":[...],\"summary\":\"...\","
            + "\"detail\":{\"plagiarism_score\":0,\"plagiarism_note\":\"...\",\"ai_generated_score\":0,\"ai_generated_note\":\"...\","
            + "\"relevance_score\":0,\"relevance_note\":\"...\",\"depth_score\":0,\"depth_note\":\"...\","
            + "\"clarity_score\":0,\"clarity_note\":\"...\",\"verdict\":\"...\"},"
            + "\"fraud\":{\"level\":\"LOW\",\"summary\":\"...\",\"items\":[{\"time\":\"00:23\",\"event\":\"Rời tab\",\"note\":\"...\"}]}}\n"
            + "Trả lời bằng tiếng Việt.";

        try
        {
            var url = "https://generativelanguage.googleapis.com/v1beta/models/" + _model + ":generateContent?key=" + _apiKey;

            var request = new GeminiRequest
            {
                Contents = new[]
                {
                    new GeminiContent
                    {
                        Parts = new[] { new GeminiPart { Text = prompt } }
                    }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    ResponseMimeType = "application/json"
                }
            };

            HttpResponseMessage response = null!;
            for (var attempt = 0; attempt < 3; attempt++)
            {
                response = await _http.PostAsJsonAsync(url, request, cancellationToken);
                if (response.IsSuccessStatusCode) break;
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini API attempt {Attempt} returned {Status}: {Body}", attempt + 1, (int)response.StatusCode, body);
                if ((int)response.StatusCode != 503 && (int)response.StatusCode != 429) break;
                await Task.Delay(2000 * (attempt + 1), cancellationToken);
            }
            if (!response.IsSuccessStatusCode) return PulseRules.AiHint(evidenceText);

            var result = await response.Content.ReadFromJsonAsync<GeminiResponse>(cancellationToken: cancellationToken);

            var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
            if (string.IsNullOrWhiteSpace(text))
            {
                _logger.LogWarning("Gemini returned empty response, falling back.");
                return PulseRules.AiHint(evidenceText);
            }

            var parsed = JsonSerializer.Deserialize<AiHintResponse>(text);
            if (parsed?.Checks == null || parsed.Checks.Count != criteria.Count)
            {
                _logger.LogWarning("Gemini returned invalid checks count, falling back.");
                return PulseRules.AiHint(evidenceText);
            }

            // Map detail
            PulseAiDetailDto? detail = null;
            if (parsed.Detail != null)
            {
                var d = parsed.Detail;
                detail = new PulseAiDetailDto
                {
                    PlagiarismScore = Clamp(d.PlagiarismScore),
                    PlagiarismNote = d.PlagiarismNote ?? "",
                    AiGeneratedScore = Clamp(d.AiGeneratedScore),
                    AiGeneratedNote = d.AiGeneratedNote ?? "",
                    RelevanceScore = Clamp(d.RelevanceScore),
                    RelevanceNote = d.RelevanceNote ?? "",
                    DepthScore = Clamp(d.DepthScore),
                    DepthNote = d.DepthNote ?? "",
                    ClarityScore = Clamp(d.ClarityScore),
                    ClarityNote = d.ClarityNote ?? "",
                    Verdict = d.Verdict ?? "",
                };
            }

            // Map fraud
            PulseAiFraudDto? fraud = null;
            if (parsed.Fraud != null)
            {
                var f = parsed.Fraud;
                fraud = new PulseAiFraudDto
                {
                    Level = f.Level ?? "LOW",
                    Summary = f.Summary ?? "",
                    Items = (f.Items ?? new List<AiFraudItemResponse>()).Select(i => new PulseAiFraudItemDto
                    {
                        Time = i.Time ?? "",
                        Event = i.Event ?? "",
                        Note = i.Note ?? "",
                    }).ToList(),
                };
            }

            return new PulseAiHintDto(parsed.Checks, parsed.Summary ?? "") { Detail = detail, Fraud = fraud };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini API call failed, falling back to keyword matching.");
            return PulseRules.AiHint(evidenceText);
        }
    }

    private static int Clamp(int v) => Math.Clamp(v, 0, 100);

    private static string FormatMs(long ms)
    {
        var totalSeconds = ms / 1000;
        var minutes = totalSeconds / 60;
        var seconds = totalSeconds % 60;
        return minutes.ToString("D2") + ":" + seconds.ToString("D2");
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrEmpty(html)) return "";
        return System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", "").Trim();
    }

    // --- JSON response classes ---

    private sealed class AiHintResponse
    {
        [JsonPropertyName("checks")]
        public List<bool> Checks { get; set; } = new();
        [JsonPropertyName("summary")]
        public string? Summary { get; set; }
        [JsonPropertyName("detail")]
        public AiDetailResponse? Detail { get; set; }
        [JsonPropertyName("fraud")]
        public AiFraudResponse? Fraud { get; set; }
    }

    private sealed class AiDetailResponse
    {
        [JsonPropertyName("plagiarism_score")] public int PlagiarismScore { get; set; }
        [JsonPropertyName("plagiarism_note")] public string? PlagiarismNote { get; set; }
        [JsonPropertyName("ai_generated_score")] public int AiGeneratedScore { get; set; }
        [JsonPropertyName("ai_generated_note")] public string? AiGeneratedNote { get; set; }
        [JsonPropertyName("relevance_score")] public int RelevanceScore { get; set; }
        [JsonPropertyName("relevance_note")] public string? RelevanceNote { get; set; }
        [JsonPropertyName("depth_score")] public int DepthScore { get; set; }
        [JsonPropertyName("depth_note")] public string? DepthNote { get; set; }
        [JsonPropertyName("clarity_score")] public int ClarityScore { get; set; }
        [JsonPropertyName("clarity_note")] public string? ClarityNote { get; set; }
        [JsonPropertyName("verdict")] public string? Verdict { get; set; }
    }

    private sealed class AiFraudResponse
    {
        [JsonPropertyName("level")] public string? Level { get; set; }
        [JsonPropertyName("summary")] public string? Summary { get; set; }
        [JsonPropertyName("items")] public List<AiFraudItemResponse>? Items { get; set; }
    }

    private sealed class AiFraudItemResponse
    {
        [JsonPropertyName("time")] public string? Time { get; set; }
        [JsonPropertyName("event")] public string? Event { get; set; }
        [JsonPropertyName("note")] public string? Note { get; set; }
    }
}

file sealed class GeminiRequest
{
    [JsonPropertyName("contents")]
    public GeminiContent[] Contents { get; set; } = Array.Empty<GeminiContent>();
    [JsonPropertyName("generationConfig")]
    public GeminiGenerationConfig? GenerationConfig { get; set; }
}

file sealed class GeminiContent
{
    [JsonPropertyName("parts")]
    public GeminiPart[] Parts { get; set; } = Array.Empty<GeminiPart>();
}

file sealed class GeminiPart
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = "";
}

file sealed class GeminiGenerationConfig
{
    [JsonPropertyName("responseMimeType")]
    public string? ResponseMimeType { get; set; }
}

file sealed class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

file sealed class GeminiCandidate
{
    [JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }
}
