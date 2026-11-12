using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.AI;

public sealed class GeminiService : IGeminiService
{
    private const string DefaultModel = "gemini-2.5-flash";
    private static readonly string[] DefaultFallbackModels = { "gemini-2.5-flash", "gemini-2.0-flash" };
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly IReadOnlyList<string> _models;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(HttpClient http, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = http;
        _apiKey = ResolveApiKey(config);
        var configured = config["Gemini:Model"]?.Trim();
        _model = string.IsNullOrWhiteSpace(configured) ? DefaultModel : configured;
        var configuredFallbacks = config.GetSection("Gemini:FallbackModels").Get<string[]>() ?? Array.Empty<string>();
        _models = new[] { _model }
            .Concat(configuredFallbacks)
            .Concat(DefaultFallbackModels)
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Select(m => m.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    /// <summary>
    /// Khóa Gemini: Gemini:ApiKey; không có thì dùng khóa trợ lý (Assistant:ApiKey = ASSISTANT_API_KEY trong .env) khi trợ lý
    /// chạy Gemini — một khóa cho cả chatbot và chấm bài; cuối cùng GEMINI_API_KEY / GOOGLE_API_KEY.
    /// </summary>
    private static string ResolveApiKey(IConfiguration config)
    {
        var key = config["Gemini:ApiKey"];
        if (!string.IsNullOrWhiteSpace(key)) return key.Trim();

        var provider = config["Assistant:Provider"];
        if (string.IsNullOrWhiteSpace(provider) || provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase))
        {
            key = config["Assistant:ApiKey"];
            if (!string.IsNullOrWhiteSpace(key)) return key.Trim();
        }

        return (Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? Environment.GetEnvironmentVariable("GOOGLE_API_KEY") ?? "").Trim();
    }

    public async Task<PulseAiHintDto> EvaluateEvidenceAsync(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
        string? courseContent = null,
        string? domainName = null,
        int? tier = null,
        IReadOnlyList<PulseCriterionDto>? rubric = null,
        CancellationToken cancellationToken = default)
    {
        var domainNumber = PulseEssayRubric.ResolveDomainNumber(null, domainName);
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("Gemini API key not configured, falling back to keyword matching.");
            return PulseRules.AiHint(evidenceText, finalPrompt, rubric, domainNumber, tier);
        }

        var prompt = EvidencePrompt(evidenceText, finalPrompt, criteria, proctoringEvents, courseContent, domainName, tier, rubric);
        return await SendEvidenceAsync(prompt, evidenceText, finalPrompt, criteria.Count, rubric, domainNumber, tier, cancellationToken);
    }

    /// <summary>Text sent to Gemini for one course-final or pre-assessment answer.</summary>
    public static string EvidencePrompt(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents,
        string? courseContent) =>
        EvidencePrompt(evidenceText, finalPrompt, criteria, proctoringEvents, courseContent, null, null, null);

    public static string EvidencePrompt(
        string evidenceText,
        string finalPrompt,
        IReadOnlyList<string> criteria,
        IReadOnlyList<ProctoringEventInfo>? proctoringEvents,
        string? courseContent,
        string? domainName,
        int? tier,
        IReadOnlyList<PulseCriterionDto>? rubric)
    {
        var criteriaList = rubric is { Count: > 0 }
            ? string.Join("\n", rubric.Select((c, i) =>
            {
                var tags = new List<string>();
                if (c.WeightPercent > 0) tags.Add($"Trọng số {c.WeightPercent}%");
                if (c.IsRequired) tags.Add("TIÊU CHÍ BẮT BUỘC (GATE)");
                var tagPrefix = tags.Count > 0 ? $" [{string.Join(" · ", tags)}]" : "";
                var desc = string.IsNullOrWhiteSpace(c.Description) ? "" : $": {c.Description}";
                return $"{i + 1}. {c.Title}{tagPrefix}{desc}";
            }))
            : string.Join("\n", criteria.Select((c, i) => (i + 1) + ". " + c));

        var criteriaCount = rubric is { Count: > 0 } ? rubric.Count : criteria.Count;

        var domainLine = string.IsNullOrWhiteSpace(domainName) ? "" : $"LĨNH VỰC NĂNG LỰC (TT02): {domainName.Trim()}\n";
        var tierLine = tier.HasValue ? $"CẤP ĐỘ KHÓA HỌC: {PulseEssayRubric.TierExpectationLabel(tier)}\n" : "";
        var contextBlock = (domainLine + tierLine).Length > 0 ? domainLine + tierLine + "\n" : "";
        var hasGate = rubric?.Any(c => c.IsRequired) == true;
        var gateRule = hasGate
            ? $"Chuẩn đạt tự luận: tổng điểm trọng số >= {PulseEssayRubric.EssayPassPercent}% VÀ không rớt TIÊU CHÍ BẮT BUỘC (GATE). Nếu bài thiếu hoặc sai nghiêm trọng nội dung của tiêu chí GATE, phải đánh dấu checks=false ở tiêu chí đó và khuyến nghị chưa đạt.\n"
            : "";

        var courseText = string.IsNullOrWhiteSpace(courseContent)
            ? ""
            : "NỘI DUNG KHÓA HỌC (kiến thức nhân viên đã học trong khóa này):\n" + courseContent.Trim() + "\n\n";
        var courseRule = courseText.Length == 0
            ? ""
            : "Đối chiếu bài nộp với NỘI DUNG KHÓA HỌC: bài áp dụng đúng kiến thức đã học thì ghi nhận; hiểu sai hoặc mâu thuẫn với nội dung khóa "
              + "thì nêu rõ điểm sai trong summary và relevance_note. Không trừ điểm vì thiếu kiến thức nằm ngoài khóa và ngoài đề.\n";

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
                + "SHARE_STOPPED=dừng chia sẻ màn hình, STARTED=bắt đầu, SUBMITTED=nộp bài, "
                + "FACE_MISSING=không thấy khuôn mặt trước camera, MULTIPLE_FACES=có nhiều người trước camera, "
                + "LOOKING_AWAY=nhìn ra ngoài màn hình lâu, FACE_CHECK_ON/OFF=nhận diện khuôn mặt trên trình duyệt chạy / không chạy được.";
        }

        return
            "Bạn là hệ thống AI hỗ trợ mentor chấm bài cuối cấp năng lực số doanh nghiệp. "
            + "Phân tích bài nộp theo từng tiêu chí đã cấu hình và trả lời JSON thuần (không markdown).\n\n"
            + "QUY TẮC QUAN TRỌNG: Chỉ chấm đạt tiêu chí (true) khi nhân viên nêu ví dụ, nguồn dữ liệu, công cụ, con số hoặc bước làm THỰC TẾ của bản thân. "
            + "Nếu bài nộp chỉ chép lại câu hỏi đề bài hoặc nói chung chung không có dẫn chứng cụ thể, phải đánh dấu tất cả checks=false, plagiarism_score>=85, relevance_score<=20 và depth_score<=15.\n\n"
            + contextBlock
            + "ĐỀ BÀI:\n" + StripHtml(finalPrompt) + "\n\n"
            + "TIÊU CHÍ CHẤM (" + criteriaCount + " tiêu chí):\n" + criteriaList + "\n\n"
            + courseText
            + "BÀI NỘP CỦA NHÂN VIÊN:\n" + evidenceText
            + eventsText + "\n\n"
            + "YÊU CẦU ĐÁNH GIÁ:\n"
            + gateRule
            + courseRule
            + "1. checks: mảng " + criteriaCount + " boolean đánh giá đạt/chưa đạt theo đúng thứ tự tiêu chí.\n"
            + "2. criterion_notes: mảng " + criteriaCount + " chuỗi nhận xét ngắn (1-2 câu tiếng Việt/tiêu chí), trích dẫn cụ thể điểm bài đã nêu hoặc điểm còn thiếu cho đúng tiêu chí đó.\n"
            + "3. summary: tóm tắt tổng quan 2 câu ngắn gọn.\n"
            + "4. detail: phân tích chi tiết gồm:\n"
            + "   - plagiarism_score (0-100): 0=nguyên bản, 100=sao chép hoàn toàn hoặc lặp nguyên văn đề bài\n"
            + "   - plagiarism_note: giải thích ngắn gọn\n"
            + "   - ai_generated_score (0-100): 0=con người viết, 100=AI viết hoàn toàn\n"
            + "   - ai_generated_note: giải thích ngắn gọn\n"
            + "   - relevance_score (0-100): 0=lạc đề/chép lại đề, 100=hoàn toàn sát yêu cầu thực tế\n"
            + "   - relevance_note: giải thích ngắn gọn\n"
            + "   - depth_score (0-100): 0=sơ sài, 100=rất chi tiết, kiểm chứng được\n"
            + "   - depth_note: giải thích ngắn gọn\n"
            + "   - clarity_score (0-100): 0=khó hiểu, 100=rất rõ ràng\n"
            + "   - clarity_note: giải thích ngắn gọn\n"
            + "   - verdict: kết luận tổng thể 1 câu cho mentor\n"
            + "5. fraud: phân tích gian lận từ sự kiện giám sát (nếu có events):\n"
            + "   - level: mức nghi ngờ (LOW/MEDIUM/HIGH)\n"
            + "   - summary: tóm tắt 1 câu về tình trạng giám sát\n"
            + "   - items: danh sách sự kiện nghi ngờ, mỗi item gồm: time (mm:ss), event, note.\n"
            + "   Nếu không có events hoặc không có gì bất thường, trả fraud.level=LOW, items=[]\n\n"
            + "Trả JSON theo cấu trúc:\n"
            + "{\"checks\":[...],\"criterion_notes\":[...],\"summary\":\"...\","
            + "\"detail\":{\"plagiarism_score\":0,\"plagiarism_note\":\"...\",\"ai_generated_score\":0,\"ai_generated_note\":\"...\","
            + "\"relevance_score\":0,\"relevance_note\":\"...\",\"depth_score\":0,\"depth_note\":\"...\","
            + "\"clarity_score\":0,\"clarity_note\":\"...\",\"verdict\":\"...\"},"
            + "\"fraud\":{\"level\":\"LOW\",\"summary\":\"...\",\"items\":[{\"time\":\"00:23\",\"event\":\"Rời tab\",\"note\":\"...\"}]}}\n"
            + "Trả lời bằng tiếng Việt.";
    }

    private async Task<PulseAiHintDto> SendEvidenceAsync(
        string prompt,
        string evidenceText,
        string finalPrompt,
        int criteriaCount,
        IReadOnlyList<PulseCriterionDto>? rubric,
        int domainNumber,
        int? tier,
        CancellationToken cancellationToken)
    {
        try
        {
            var (text, usedModel) = await GenerateJsonAsync(prompt, cancellationToken);
            if (string.IsNullOrWhiteSpace(text))
            {
                _logger.LogWarning("Gemini returned no answer, falling back.");
                return PulseRules.AiHint(evidenceText, finalPrompt, rubric, domainNumber, tier);
            }

            var parsed = JsonSerializer.Deserialize<AiHintResponse>(TrimCodeFences(text), JsonOptions);
            if (parsed?.Checks == null || parsed.Checks.Count != criteriaCount)
            {
                _logger.LogWarning("Gemini returned invalid checks count, falling back.");
                return PulseRules.AiHint(evidenceText, finalPrompt, rubric, domainNumber, tier);
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

            var checks = parsed.Checks.ToList();
            var criterionNotes = parsed.CriterionNotes is { Count: > 0 }
                ? Enumerable.Range(0, criteriaCount)
                    .Select(idx => idx < parsed.CriterionNotes.Count ? (parsed.CriterionNotes[idx] ?? "").Trim() : "")
                    .ToList()
                : null;
            var summary = parsed.Summary ?? "";

            // Guard cứng ở backend: nếu bài chép nguyên văn đề bài, không để Gemini lọt checks=true.
            if (PulseEssayRubric.AnalyzePromptCopy(evidenceText, finalPrompt).IsPromptCopy)
            {
                checks = Enumerable.Repeat(false, criteriaCount).ToList();
                criterionNotes = Enumerable.Range(0, criteriaCount)
                    .Select(_ => "Nội dung lặp lại câu chữ đề bài, chưa có tình huống thực tế và dẫn chứng kiểm chứng.")
                    .ToList();
                summary = "Cảnh báo: Bài nộp đang lặp lại nội dung đề bài, chưa nêu tình huống công việc thực tế và dẫn chứng kiểm chứng. Cần yêu cầu bổ sung trước khi công nhận.";
                if (detail != null)
                {
                    detail = detail with
                    {
                        PlagiarismScore = Math.Max(detail.PlagiarismScore, 90),
                        PlagiarismNote = string.IsNullOrWhiteSpace(detail.PlagiarismNote)
                            ? "Lặp lại nội dung câu hỏi đề bài."
                            : detail.PlagiarismNote,
                        RelevanceScore = Math.Min(detail.RelevanceScore, 20),
                        DepthScore = Math.Min(detail.DepthScore, 15),
                        Verdict = "Chưa đạt: bài nộp lặp lại nội dung đề bài, thiếu ví dụ thực tế và dẫn chứng kiểm chứng.",
                    };
                }
            }

            return new PulseAiHintDto(checks, summary)
            {
                CriterionNotes = criterionNotes,
                Source = "GEMINI",
                Model = usedModel ?? _model,
                Detail = detail,
                Fraud = fraud,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini API call failed, falling back to keyword matching.");
            return PulseRules.AiHint(evidenceText, finalPrompt, rubric, domainNumber, tier);
        }
    }

    public async Task<TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(
        IReadOnlyList<TrialEssayAiInput> essays,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || essays.Count == 0) return null;

        var levels = new Dictionary<int, string> { [1] = "Cơ bản", [2] = "Trung cấp", [3] = "Nâng cao" };
        var parts = essays.Select(e =>
            "BÀI " + e.Tier + " — cấp " + levels.GetValueOrDefault(e.Tier, e.Tier.ToString()) + " · " + e.Title + "\n"
            + "Đề: " + e.Prompt + "\n"
            + "Bài làm:\n" + e.Answer.Trim());
        var prompt =
            "Bạn là mentor chấm bài đánh giá năng lực số (Khung năng lực số TT02/2025) của nhân viên doanh nghiệp. "
            + "Chấm từng bài tự luận dưới đây theo thang 0–10 (đạt khi từ " + TrialProgramRules.EssayPassScore + " điểm), "
            + "theo yêu cầu của đúng cấp bài đó: Cơ bản = làm được việc số hằng ngày; Trung cấp = tự giải quyết vấn đề của nhóm "
            + "bằng công cụ số; Nâng cao = đề xuất cải tiến, quản trị rủi ro dữ liệu và đo hiệu quả.\n"
            + "Tiêu chí: đúng trọng tâm đề; cụ thể (công cụ, các bước, dữ liệu); kiểm chứng được (cách kiểm tra hoặc đo kết quả); "
            + "độ sâu phù hợp cấp. Bài sơ sài, chung chung, lạc đề hoặc chép lại đề thì dưới 5.\n\n"
            + string.Join("\n\n", parts) + "\n\n"
            + "Trả JSON thuần (không markdown): {\"essays\":[{\"tier\":1,\"score\":0,\"feedback\":\"...\"}],\"summary\":\"...\"}. "
            + "feedback: 1–2 câu nêu điểm làm được và điều còn thiếu. summary: 1 câu nhận xét chung. Trả lời bằng tiếng Việt.";

        try
        {
            var (text, usedModel) = await GenerateJsonAsync(prompt, cancellationToken);
            if (string.IsNullOrWhiteSpace(text)) return null;

            var parsed = JsonSerializer.Deserialize<EssayReviewResponse>(TrimCodeFences(text), JsonOptions);
            var byTier = (parsed?.Essays ?? new List<EssayScoreResponse>())
                .GroupBy(e => e.Tier)
                .ToDictionary(g => g.Key, g => g.First());
            if (essays.Any(e => !byTier.ContainsKey(e.Tier)))
            {
                _logger.LogWarning("Gemini essay review is missing tiers, ignoring it.");
                return null;
            }

            return new TrialEssayAiReviewDto
            {
                Essays = essays.Select(e =>
                {
                    var score = Math.Clamp(byTier[e.Tier].Score, 0, TrialProgramRules.EssayMaxScore);
                    return new TrialEssayAiScoreDto
                    {
                        Tier = e.Tier,
                        Score = score,
                        Passed = score >= TrialProgramRules.EssayPassScore,
                        Feedback = byTier[e.Tier].Feedback?.Trim() ?? "",
                    };
                }).ToList(),
                Summary = parsed?.Summary?.Trim() ?? "",
                Model = usedModel ?? _model,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini essay review failed.");
            return null;
        }
    }

    /// <summary>Gọi generateContent (trả JSON), thử lại khi 429/503 và chuyển model dự phòng nếu model chính không khả dụng. Khóa gửi qua header.</summary>
    private async Task<(string? Text, string? Model)> GenerateJsonAsync(string prompt, CancellationToken cancellationToken)
    {
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

        foreach (var model in _models)
        {
            var url = "https://generativelanguage.googleapis.com/v1beta/models/" + Uri.EscapeDataString(model) + ":generateContent";
            for (var attempt = 0; attempt < 2; attempt++)
            {
                using var message = new HttpRequestMessage(HttpMethod.Post, url) { Content = JsonContent.Create(request) };
                message.Headers.Add("x-goog-api-key", _apiKey);
                using var response = await _http.SendAsync(message, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<GeminiResponse>(cancellationToken: cancellationToken);
                    var raw = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                    if (!string.IsNullOrWhiteSpace(raw))
                    {
                        return (raw, model);
                    }
                    break;
                }

                var status = (int)response.StatusCode;
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini API model {Model} attempt {Attempt} returned {Status}: {Body}", model, attempt + 1, status, body);

                // Model không tồn tại / không hỗ trợ generateContent -> chuyển model dự phòng ngay
                if (status is 400 or 404) break;
                // Key sai / hết quyền -> dừng luôn, không retry vô ích
                if (status is 401 or 403) return (null, null);
                // Rate limit / Quá tải tạm thời -> thử lại ngắn rồi sang model dự phòng
                if (status is 429 or 503 && attempt == 0)
                {
                    await Task.Delay(1200, cancellationToken);
                    continue;
                }
                break;
            }
        }

        return (null, null);
    }

    private static string TrimCodeFences(string text)
    {
        var trimmed = text.Trim();
        if (!trimmed.StartsWith("```", StringComparison.Ordinal)) return trimmed;
        var firstNewline = trimmed.IndexOf('\n');
        var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
        if (firstNewline >= 0 && lastFence > firstNewline)
        {
            return trimmed[(firstNewline + 1)..lastFence].Trim();
        }
        return trimmed;
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
        [JsonPropertyName("criterion_notes")]
        public List<string>? CriterionNotes { get; set; }
        [JsonPropertyName("summary")]
        public string? Summary { get; set; }
        [JsonPropertyName("detail")]
        public AiDetailResponse? Detail { get; set; }
        [JsonPropertyName("fraud")]
        public AiFraudResponse? Fraud { get; set; }
    }

    private sealed class EssayReviewResponse
    {
        [JsonPropertyName("essays")] public List<EssayScoreResponse>? Essays { get; set; }
        [JsonPropertyName("summary")] public string? Summary { get; set; }
    }

    private sealed class EssayScoreResponse
    {
        [JsonPropertyName("tier")] public int Tier { get; set; }
        [JsonPropertyName("score")] public int Score { get; set; }
        [JsonPropertyName("feedback")] public string? Feedback { get; set; }
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
