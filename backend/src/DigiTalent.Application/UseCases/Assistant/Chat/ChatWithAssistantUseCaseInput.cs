namespace DigiTalent.Application.UseCases.Assistant.Chat;

/// <summary>
/// Toàn bộ hội thoại dạng văn bản (máy chủ không lưu lịch sử): các lượt user/assistant xen kẽ, lượt cuối là user.
/// </summary>
public class ChatWithAssistantUseCaseInput
{
    public List<ChatWithAssistantMessage> Messages { get; set; } = new();
}

public class ChatWithAssistantMessage
{
    /// <summary>"user" | "assistant".</summary>
    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
}
