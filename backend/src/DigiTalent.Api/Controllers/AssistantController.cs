using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Assistant.Chat;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Chatbot trợ lý AI: trả lời câu hỏi về dữ liệu của doanh nghiệp bằng các tool chỉ đọc
/// (giới hạn theo tổ chức, phạm vi nhân viên và quyền của người hỏi). Máy chủ không lưu hội thoại.
/// </summary>
[ApiController]
[Route("api/v1/assistant")]
public class AssistantController : ControllerBase
{
    // POST api/v1/assistant/chat  { messages: [{ role: "user", content: "..." }, ...] }
    [HttpPost("chat")]
    [HasPermission(Permissions.Assistant.Chat)]
    public async Task<ActionResult<ApiResponse<ChatWithAssistantUseCaseOutput>>> Chat(
        [FromBody] ChatWithAssistantUseCaseInput input,
        [FromServices] IUseCase<ChatWithAssistantUseCaseInput, ChatWithAssistantUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ChatWithAssistantUseCaseOutput>.Ok(result));
    }
}
