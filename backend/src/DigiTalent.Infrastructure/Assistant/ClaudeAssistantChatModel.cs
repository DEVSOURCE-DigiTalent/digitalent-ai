using System.Text.Json;
using Anthropic;
using Anthropic.Exceptions;
using Anthropic.Models.Beta.Messages;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Assistant;

/// <summary>
/// Chatbot chạy trên Claude (Messages API, vòng lặp tool use tự viết): gửi hội thoại + tool, chạy các tool
/// mô hình yêu cầu qua <see cref="AssistantModelRequest.ExecuteToolAsync"/>, lặp tới khi mô hình trả lời xong.
/// Dùng endpoint beta để bật dự phòng phía máy chủ khi mô hình từ chối (server-side fallback).
/// </summary>
public sealed class ClaudeAssistantChatModel : IAssistantChatModel
{
    private const string FallbackBeta = "server-side-fallback-2026-07-01";

    private readonly AssistantSettings _settings;
    private readonly ILogger<ClaudeAssistantChatModel> _logger;
    private readonly AnthropicClient? _client;

    public ClaudeAssistantChatModel(AssistantSettings settings, ILogger<ClaudeAssistantChatModel> logger)
    {
        _settings = settings;
        _logger = logger;
        var apiKey = settings.ResolveApiKey();
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            _client = new AnthropicClient { ApiKey = apiKey };
        }
    }

    public bool IsConfigured => _client != null;

    public async Task<AssistantModelReply> CompleteAsync(AssistantModelRequest request, CancellationToken cancellationToken = default)
    {
        var client = _client ?? throw new InvalidOperationException("Assistant API key is not configured.");

        var tools = request.Tools.Select(ToTool).ToList();
        var messages = request.Turns
            .Select(t => t.Role == "assistant"
                ? (BetaMessageParam)new BetaAssistantMessageParam { Content = t.Content }
                : new BetaUserMessageParam { Content = t.Content })
            .ToList();
        var toolCalls = new List<AssistantToolCall>();

        for (var round = 0; round <= _settings.MaxToolRounds; round++)
        {
            var allowTools = round < _settings.MaxToolRounds;
            var response = await CreateAsync(client, request.SystemPrompt, messages, allowTools ? tools : null, cancellationToken);

            if (response.StopReason == "refusal")
            {
                _logger.LogWarning("Assistant reply refused (category {Category}).", response.StopDetails?.Category);
                return new AssistantModelReply("Xin lỗi, tôi không thể hỗ trợ yêu cầu này.", toolCalls);
            }

            if (response.StopReason != "tool_use")
            {
                var text = string.Join("\n\n", response.Content
                    .Select(b => b.TryPickText(out var t) ? t.Text : null)
                    .Where(t => !string.IsNullOrWhiteSpace(t)));
                if (response.StopReason == "max_tokens")
                {
                    text += "\n\n_(Câu trả lời bị cắt do quá dài — hãy hỏi cụ thể hơn.)_";
                }

                return new AssistantModelReply(
                    string.IsNullOrWhiteSpace(text) ? "Không tìm thấy dữ liệu phù hợp." : text,
                    toolCalls);
            }

            // Lặp lại nguyên văn lượt của mô hình (kể cả thinking có chữ ký), rồi trả TẤT CẢ tool_result trong MỘT lượt user.
            // Nếu mô hình dự phòng tiếp quản giữa chừng: bỏ thinking / tool_use nằm TRƯỚC khối fallback cuối cùng.
            var lastFallback = -1;
            for (var i = 0; i < response.Content.Count; i++)
            {
                if (response.Content[i].TryPickFallback(out _)) lastFallback = i;
            }

            var assistantContent = new List<BetaContentBlockParam>();
            var toolResults = new List<BetaContentBlockParam>();
            for (var i = 0; i < response.Content.Count; i++)
            {
                var block = response.Content[i];
                if (i < lastFallback && !block.TryPickText(out _)) continue;

                if (block.TryPickText(out var text))
                {
                    assistantContent.Add(new BetaTextBlockParam { Text = text.Text });
                }
                else if (block.TryPickThinking(out var thinking))
                {
                    assistantContent.Add(new BetaThinkingBlockParam { Thinking = thinking.Thinking, Signature = thinking.Signature });
                }
                else if (block.TryPickRedactedThinking(out var redacted))
                {
                    assistantContent.Add(new BetaRedactedThinkingBlockParam { Data = redacted.Data });
                }
                else if (block.TryPickToolUse(out var toolUse))
                {
                    assistantContent.Add(new BetaToolUseBlockParam { ID = toolUse.ID, Name = toolUse.Name, Input = toolUse.Input });

                    // DbContext không an toàn đa luồng → chạy tuần tự, nhưng vẫn gom kết quả vào một lượt.
                    var input = JsonSerializer.SerializeToElement(toolUse.Input);
                    var outcome = await request.ExecuteToolAsync(toolUse.Name, input);
                    toolCalls.Add(new AssistantToolCall(toolUse.Name, !outcome.IsError, outcome.Source));
                    toolResults.Add(new BetaToolResultBlockParam
                    {
                        ToolUseID = toolUse.ID,
                        Content = outcome.Content,
                        IsError = outcome.IsError,
                    });
                }
            }

            messages.Add(new BetaAssistantMessageParam { Content = assistantContent });
            messages.Add(new BetaUserMessageParam { Content = toolResults });
        }

        return new AssistantModelReply("Câu hỏi cần quá nhiều bước tra cứu. Hãy hỏi cụ thể hơn.", toolCalls);
    }

    private async Task<BetaMessage> CreateAsync(
        AnthropicClient client,
        string systemPrompt,
        List<BetaMessageParam> messages,
        List<BetaToolUnion>? tools,
        CancellationToken cancellationToken)
    {
        var parameters = new MessageCreateParams
        {
            Model = _settings.ResolveModel(),
            MaxTokens = _settings.MaxTokens,
            Betas = [FallbackBeta],
            Fallbacks = new Default(),
            OutputConfig = new BetaOutputConfig { Effort = _settings.Effort },
            // Lời nhắc hệ thống cố định + bộ tool cố định → cache được qua các lượt.
            System = new List<BetaTextBlockParam>
            {
                new() { Text = systemPrompt, CacheControl = new BetaCacheControlEphemeral() },
            },
            Tools = tools,
            Messages = messages,
        };

        try
        {
            return await client.Beta.Messages.Create(parameters, cancellationToken);
        }
        catch (AnthropicRateLimitException ex)
        {
            _logger.LogWarning(ex, "Assistant rate limited.");
            throw new BadRequestException("Chatbot đang quá tải, vui lòng thử lại sau ít phút.", "assistant", "ASSISTANT_BUSY");
        }
        catch (AnthropicUnauthorizedException ex)
        {
            _logger.LogError(ex, "Assistant API key rejected.");
            throw new BadRequestException("Khóa API của chatbot không hợp lệ.", "assistant", "ASSISTANT_NOT_CONFIGURED");
        }
        catch (Anthropic5xxException ex)
        {
            _logger.LogWarning(ex, "Assistant upstream error.");
            throw new BadRequestException("Dịch vụ AI tạm thời gián đoạn, vui lòng thử lại.", "assistant", "ASSISTANT_UNAVAILABLE");
        }
        catch (AnthropicIOException ex)
        {
            _logger.LogWarning(ex, "Assistant connection error.");
            throw new BadRequestException("Không kết nối được dịch vụ AI, vui lòng thử lại.", "assistant", "ASSISTANT_UNAVAILABLE");
        }
        catch (AnthropicApiException ex)
        {
            _logger.LogError(ex, "Assistant request failed.");
            throw new BadRequestException("Chatbot không xử lý được câu hỏi này.", "assistant", "ASSISTANT_ERROR");
        }
    }

    private static BetaToolUnion ToTool(AssistantToolDefinition definition)
    {
        var schema = definition.InputSchema;
        var properties = schema.TryGetProperty("properties", out var p) && p.ValueKind == JsonValueKind.Object
            ? p.EnumerateObject().ToDictionary(x => x.Name, x => x.Value.Clone())
            : new Dictionary<string, JsonElement>();
        var required = schema.TryGetProperty("required", out var r) && r.ValueKind == JsonValueKind.Array
            ? r.EnumerateArray().Select(x => x.GetString()!).ToList()
            : new List<string>();

        return new BetaTool
        {
            Name = definition.Name,
            Description = definition.Description,
            InputSchema = new() { Properties = properties, Required = required },
        };
    }
}
