using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Tệp ghi hình bài làm có giám sát cho trang chấm bài (MG-13). Thẻ &lt;video&gt; không gửi được bearer token nên
/// endpoint không dùng [HasPermission]: link đã ký có hạn (IProctoringRecordingUrlSigner) chỉ được trả cho người chấm có
/// quyền với bài làm (GET /pulse/final-reviews). Hỗ trợ range request để tua.
/// </summary>
[ApiController]
[Route("api/v1/pulse/recordings")]
public class PulseRecordingsController : ControllerBase
{
    // GET api/v1/pulse/recordings/{recordingId}/content?exp=&sig= — link đã ký (không kiểm tra quyền theo token)
    [HttpGet("{recordingId:guid}/content")]
    public async Task<IActionResult> GetContent(
        Guid recordingId,
        [FromQuery] long exp,
        [FromQuery] string? sig,
        [FromServices] IUseCase<GetPulseRecordingContentUseCaseInput, GetPulseRecordingContentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseRecordingContentUseCaseInput { RecordingId = recordingId, ExpiresAt = exp, Signature = sig });
        Response.Headers.CacheControl = "private, max-age=3600";
        return File(result.Content, result.ContentType, enableRangeProcessing: true);
    }
}
