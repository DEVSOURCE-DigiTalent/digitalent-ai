namespace DigiTalent.Infrastructure.Assistant;

/// <summary>
/// Cấu hình chatbot (section "Assistant"). Provider = Claude | Gemini. Khóa API KHÔNG ghi vào appsettings:
/// đặt Assistant__ApiKey (hoặc dotnet user-secrets), hoặc ANTHROPIC_API_KEY (Claude) / GEMINI_API_KEY (Gemini).
/// </summary>
public class AssistantSettings
{
    public const string ClaudeProvider = "Claude";
    public const string GeminiProvider = "Gemini";

    public string Provider { get; set; } = ClaudeProvider;

    public string? ApiKey { get; set; }

    /// <summary>Để trống = mô hình mặc định của provider.</summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gemini: mô hình thử lần lượt khi mô hình chính quá tải (429/503/hết giờ) ở lượt gọi đầu của câu hỏi.
    /// Chỉ đổi ở lượt đầu vì thoughtSignature của mô hình này không dùng được cho mô hình khác.
    /// </summary>
    public List<string> FallbackModels { get; set; } = new();

    /// <summary>Claude: low | medium | high | xhigh | max. Hỏi đáp tra cứu thường đủ với medium.</summary>
    public string Effort { get; set; } = "medium";

    public long MaxTokens { get; set; } = 16000;

    /// <summary>Số vòng gọi tool tối đa trong một câu hỏi; vòng cuối buộc mô hình trả lời.</summary>
    public int MaxToolRounds { get; set; } = 8;

    public string GeminiBaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta/";

    public bool IsGemini => string.Equals(Provider, GeminiProvider, StringComparison.OrdinalIgnoreCase);

    public string ResolveModel() =>
        !string.IsNullOrWhiteSpace(Model) ? Model : IsGemini ? "gemini-3.5-flash" : "claude-opus-5-5";

    /// <summary>Mô hình chính rồi tới các mô hình dự phòng (không trùng).</summary>
    public IReadOnlyList<string> ResolveModels() =>
        new[] { ResolveModel() }
            .Concat(FallbackModels.Where(m => !string.IsNullOrWhiteSpace(m)).Select(m => m.Trim()))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    public string? ResolveApiKey()
    {
        if (!string.IsNullOrWhiteSpace(ApiKey)) return ApiKey;
        return IsGemini
            ? Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? Environment.GetEnvironmentVariable("GOOGLE_API_KEY")
            : Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY");
    }
}
