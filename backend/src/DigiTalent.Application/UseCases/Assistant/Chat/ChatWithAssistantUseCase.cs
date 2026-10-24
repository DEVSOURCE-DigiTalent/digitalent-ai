using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Assistant.Chat;

/// <summary>
/// Chatbot trợ lý: gửi hội thoại cho mô hình kèm 4 tool chỉ đọc, mô hình tự gọi tool rồi trả lời.
/// Mọi dữ liệu mô hình thấy đều đi qua <see cref="AssistantToolbox"/> (giới hạn theo tổ chức, phạm vi nhân viên và quyền).
/// </summary>
public class ChatWithAssistantUseCase : IUseCase<ChatWithAssistantUseCaseInput, ChatWithAssistantUseCaseOutput>
{
    private readonly IAssistantChatModel _model;
    private readonly AssistantToolbox _toolbox;
    private readonly ICurrentUser _currentUser;

    public ChatWithAssistantUseCase(IAssistantChatModel model, AssistantToolbox toolbox, ICurrentUser currentUser)
    {
        _model = model;
        _toolbox = toolbox;
        _currentUser = currentUser;
    }

    public async Task<ChatWithAssistantUseCaseOutput> ExecuteAsync(ChatWithAssistantUseCaseInput input)
    {
        // Dữ liệu của chatbot là dữ liệu doanh nghiệp: tài khoản không thuộc tổ chức nào → 403.
        _currentUser.GetRequiredOrganizationId();

        if (!_model.IsConfigured)
        {
            throw new BadRequestException(
                "Chatbot chưa được cấu hình khóa API.", "assistant", "ASSISTANT_NOT_CONFIGURED");
        }

        var turns = input.Messages
            .Select(m => new AssistantChatTurn(m.Role, m.Content.Trim()))
            .ToList();

        var reply = await _model.CompleteAsync(new AssistantModelRequest(
            AssistantSystemPrompt.Text,
            turns,
            AssistantToolbox.Definitions,
            _toolbox.ExecuteAsync));

        return new ChatWithAssistantUseCaseOutput
        {
            Reply = reply.Text,
            Sources = reply.ToolCalls
                .Where(c => c.Succeeded && c.Source != null)
                .Select(c => c.Source!)
                .Distinct()
                .ToList(),
            ToolCalls = reply.ToolCalls
                .Select(c => new ChatWithAssistantToolCall { Name = c.Name, Succeeded = c.Succeeded })
                .ToList(),
        };
    }
}
