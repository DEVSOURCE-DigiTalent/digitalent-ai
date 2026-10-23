using System.Text.Json;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Mô hình ngôn ngữ chạy chatbot trợ lý (Infrastructure: Claude). Mô hình chỉ thấy dữ liệu qua các tool
/// do Application cấp (<see cref="AssistantModelRequest.ExecuteToolAsync"/>), đã lọc theo quyền người gọi.
/// </summary>
public interface IAssistantChatModel
{
    /// <summary>Đã cấu hình khóa API chưa? Chưa → chatbot trả lỗi ASSISTANT_NOT_CONFIGURED.</summary>
    bool IsConfigured { get; }

    Task<AssistantModelReply> CompleteAsync(AssistantModelRequest request, CancellationToken cancellationToken = default);
}

/// <summary>Một lượt hội thoại dạng văn bản: Role = "user" | "assistant".</summary>
public sealed record AssistantChatTurn(string Role, string Content);

/// <summary>Tool chỉ đọc: InputSchema là JSON Schema dạng object (properties, required).</summary>
public sealed record AssistantToolDefinition(string Name, string Description, JsonElement InputSchema);

/// <summary>Kết quả chạy tool, đã tuần tự hóa JSON. IsError = tool từ chối hoặc đầu vào sai.</summary>
public sealed record AssistantToolOutcome(string Content, bool IsError, string? Source = null);

public sealed record AssistantModelRequest(
    string SystemPrompt,
    IReadOnlyList<AssistantChatTurn> Turns,
    IReadOnlyList<AssistantToolDefinition> Tools,
    Func<string, JsonElement, Task<AssistantToolOutcome>> ExecuteToolAsync);

public sealed record AssistantToolCall(string Name, bool Succeeded, string? Source);

public sealed record AssistantModelReply(string Text, IReadOnlyList<AssistantToolCall> ToolCalls);
