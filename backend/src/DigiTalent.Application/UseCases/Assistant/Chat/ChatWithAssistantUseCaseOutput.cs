namespace DigiTalent.Application.UseCases.Assistant.Chat;

public class ChatWithAssistantUseCaseOutput
{
    /// <summary>Câu trả lời (Markdown).</summary>
    public string Reply { get; set; } = string.Empty;

    /// <summary>Loại bản ghi / chỉ số đã đọc thành công để trả lời (VD: enrollments, analytics:learning_progress).</summary>
    public List<string> Sources { get; set; } = new();

    /// <summary>Các lần gọi tool trong lượt này (tên + thành công hay bị từ chối).</summary>
    public List<ChatWithAssistantToolCall> ToolCalls { get; set; } = new();
}

public class ChatWithAssistantToolCall
{
    public string Name { get; set; } = string.Empty;

    public bool Succeeded { get; set; }
}
