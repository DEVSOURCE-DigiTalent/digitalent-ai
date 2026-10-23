using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Assistant;

/// <summary>
/// Chatbot chạy trên Gemini (REST generateContent, vòng lặp function calling tự viết): gửi hội thoại + tool, chạy các
/// tool mô hình yêu cầu qua <see cref="AssistantModelRequest.ExecuteToolAsync"/>, lặp tới khi mô hình trả lời xong.
/// Lượt của mô hình được gửi lại nguyên văn để giữ thoughtSignature (Gemini 2.5+ bắt buộc khi gọi tool nhiều bước).
/// </summary>
public sealed class GeminiAssistantChatModel : IAssistantChatModel
{
    private static readonly HashSet<string> BlockedFinishReasons =
        ["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "IMAGE_SAFETY"];

    private readonly HttpClient _http;
    private readonly AssistantSettings _settings;
    private readonly ILogger<GeminiAssistantChatModel> _logger;
    private readonly string? _apiKey;

    public GeminiAssistantChatModel(HttpClient http, AssistantSettings settings, ILogger<GeminiAssistantChatModel> logger)
    {
        _http = http;
        _settings = settings;
        _logger = logger;
        _apiKey = settings.ResolveApiKey();
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<AssistantModelReply> CompleteAsync(AssistantModelRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured) throw new InvalidOperationException("Assistant API key is not configured.");

        var tools = new JsonArray(new JsonObject
        {
            ["functionDeclarations"] = new JsonArray(request.Tools.Select(ToFunctionDeclaration).ToArray<JsonNode?>()),
        });
        var contents = new JsonArray(request.Turns
            .Select(t => (JsonNode?)Content(t.Role == "assistant" ? "model" : "user", new JsonObject { ["text"] = t.Content }))
            .ToArray());
        var toolCalls = new List<AssistantToolCall>();
        var models = _settings.ResolveModels();
        var modelIndex = 0;

        for (var round = 0; round <= _settings.MaxToolRounds; round++)
        {
            var allowTools = round < _settings.MaxToolRounds;
            JsonNode response;
            while (true)
            {
                try
                {
                    response = await GenerateAsync(models[modelIndex], request.SystemPrompt, contents, tools, allowTools, cancellationToken);
                    break;
                }
                catch (BadRequestException ex) when (round == 0 && modelIndex < models.Count - 1 && IsTransient(ex))
                {
                    _logger.LogWarning("Assistant model {Model} unavailable, falling back to {Fallback}.",
                        models[modelIndex], models[modelIndex + 1]);
                    modelIndex++;
                }
            }

            var candidate = response["candidates"]?.AsArray().FirstOrDefault();
            var finishReason = candidate?["finishReason"]?.GetValue<string>();
            if (candidate == null || (finishReason != null && BlockedFinishReasons.Contains(finishReason)))
            {
                _logger.LogWarning("Assistant reply blocked ({Reason}).",
                    finishReason ?? response["promptFeedback"]?["blockReason"]?.GetValue<string>() ?? "no candidate");
                return new AssistantModelReply("Xin lỗi, tôi không thể hỗ trợ yêu cầu này.", toolCalls);
            }

            var parts = candidate["content"]?["parts"]?.AsArray() ?? new JsonArray();
            var calls = parts.Select(p => p?["functionCall"]).OfType<JsonObject>().ToList();

            if (calls.Count == 0)
            {
                var text = string.Concat(parts
                    .Where(p => p?["thought"]?.GetValue<bool>() != true)
                    .Select(p => p?["text"]?.GetValue<string>()));
                if (finishReason == "MAX_TOKENS")
                {
                    text += "\n\n_(Câu trả lời bị cắt do quá dài — hãy hỏi cụ thể hơn.)_";
                }

                if (string.IsNullOrWhiteSpace(text))
                {
                    // STOP mà không có chữ = không có gì để nói; lý do khác (MALFORMED_FUNCTION_CALL…) = mô hình lỗi.
                    _logger.LogWarning("Assistant reply empty ({Reason}).", finishReason ?? "none");
                    text = finishReason is null or "STOP"
                        ? "Không tìm thấy dữ liệu phù hợp."
                        : "Xin lỗi, tôi chưa trả lời được câu này. Hãy thử hỏi lại hoặc diễn đạt cụ thể hơn.";
                }

                return new AssistantModelReply(text.Trim(), toolCalls);
            }

            // Lặp lại nguyên văn lượt của mô hình, rồi trả TẤT CẢ functionResponse trong MỘT lượt user, cùng thứ tự.
            var modelContent = candidate["content"]!.DeepClone().AsObject();
            modelContent["role"] = "model";
            contents.Add(modelContent);

            var responses = new JsonArray();
            foreach (var call in calls)
            {
                var name = call["name"]?.GetValue<string>() ?? string.Empty;
                // DbContext không an toàn đa luồng → chạy tuần tự.
                var args = JsonSerializer.SerializeToElement(call["args"] ?? new JsonObject());
                var outcome = await request.ExecuteToolAsync(name, args);
                toolCalls.Add(new AssistantToolCall(name, !outcome.IsError, outcome.Source));

                var functionResponse = new JsonObject
                {
                    ["name"] = name,
                    ["response"] = new JsonObject { [outcome.IsError ? "error" : "result"] = ParseOrString(outcome.Content) },
                };
                if (call["id"] is JsonNode id) functionResponse["id"] = id.DeepClone();
                responses.Add(new JsonObject { ["functionResponse"] = functionResponse });
            }

            contents.Add(new JsonObject { ["role"] = "user", ["parts"] = responses });
        }

        return new AssistantModelReply("Câu hỏi cần quá nhiều bước tra cứu. Hãy hỏi cụ thể hơn.", toolCalls);
    }

    private static bool IsTransient(BadRequestException ex) =>
        ex.Errors.Any(e => e.Code is "ASSISTANT_BUSY" or "ASSISTANT_UNAVAILABLE");

    private async Task<JsonNode> GenerateAsync(
        string model, string systemPrompt, JsonArray contents, JsonArray tools, bool allowTools, CancellationToken cancellationToken)
    {
        var body = new JsonObject
        {
            ["systemInstruction"] = new JsonObject { ["parts"] = new JsonArray(new JsonObject { ["text"] = systemPrompt }) },
            ["contents"] = contents.DeepClone(),
            // Vòng cuối vẫn khai báo tool (lịch sử có functionCall) nhưng cấm gọi → buộc mô hình trả lời.
            ["tools"] = tools.DeepClone(),
            ["toolConfig"] = new JsonObject
            {
                ["functionCallingConfig"] = new JsonObject { ["mode"] = allowTools ? "AUTO" : "NONE" },
            },
            ["generationConfig"] = new JsonObject { ["maxOutputTokens"] = _settings.MaxTokens },
        };

        var baseUrl = _settings.GeminiBaseUrl.TrimEnd('/');
        using var message = new HttpRequestMessage(HttpMethod.Post,
            $"{baseUrl}/models/{Uri.EscapeDataString(model)}:generateContent")
        {
            Content = JsonContent.Create(body),
        };
        message.Headers.Add("x-goog-api-key", _apiKey);

        HttpResponseMessage response;
        try
        {
            response = await _http.SendAsync(message, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException || (ex is TaskCanceledException && !cancellationToken.IsCancellationRequested))
        {
            _logger.LogWarning(ex, "Assistant connection error.");
            throw new BadRequestException("Không kết nối được dịch vụ AI, vui lòng thử lại.", "assistant", "ASSISTANT_UNAVAILABLE");
        }

        using (response)
        {
            var payload = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return JsonNode.Parse(payload) ?? new JsonObject();
            }

            var status = (int)response.StatusCode;
            var detail = payload.Length > 500 ? payload[..500] : payload;
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                _logger.LogWarning("Assistant rate limited: {Detail}", detail);
                throw new BadRequestException("Chatbot đang quá tải, vui lòng thử lại sau ít phút.", "assistant", "ASSISTANT_BUSY");
            }

            if (status is 401 or 403 || payload.Contains("API_KEY_INVALID", StringComparison.Ordinal))
            {
                _logger.LogError("Assistant API key rejected ({Status}): {Detail}", status, detail);
                throw new BadRequestException("Khóa API của chatbot không hợp lệ.", "assistant", "ASSISTANT_NOT_CONFIGURED");
            }

            if (status >= 500)
            {
                _logger.LogWarning("Assistant upstream error ({Status}): {Detail}", status, detail);
                throw new BadRequestException("Dịch vụ AI tạm thời gián đoạn, vui lòng thử lại.", "assistant", "ASSISTANT_UNAVAILABLE");
            }

            _logger.LogError("Assistant request failed ({Status}): {Detail}", status, detail);
            throw new BadRequestException("Chatbot không xử lý được câu hỏi này.", "assistant", "ASSISTANT_ERROR");
        }
    }

    private static JsonObject Content(string role, JsonObject part) =>
        new() { ["role"] = role, ["parts"] = new JsonArray(part) };

    private static JsonNode? ToFunctionDeclaration(AssistantToolDefinition definition) => new JsonObject
    {
        ["name"] = definition.Name,
        ["description"] = definition.Description,
        // parametersJsonSchema nhận JSON Schema đầy đủ (enum, minimum, additionalProperties…).
        ["parametersJsonSchema"] = JsonNode.Parse(definition.InputSchema.GetRawText()),
    };

    private static JsonNode? ParseOrString(string content)
    {
        try
        {
            return JsonNode.Parse(content);
        }
        catch (JsonException)
        {
            return JsonValue.Create(content);
        }
    }
}
