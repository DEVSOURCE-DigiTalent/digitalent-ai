using DigiTalent.Api.Common;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/individual-registrations")]
public class IndividualRegistrationsController : ControllerBase
{
    private readonly IndividualCommerceService _commerceService;

    public IndividualRegistrationsController(IndividualCommerceService commerceService)
    {
        _commerceService = commerceService;
    }

    /// <summary>
    /// Bắt đầu đăng ký cá nhân (TRIAL hoặc PURCHASE). Trả về 202 Accepted.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<StartIndividualRegistrationResponse>>> StartRegistration(
        [FromBody] StartIndividualRegistrationRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        var result = await _commerceService.StartRegistrationAsync(request, idempotencyKey, cancellationToken);
        return Accepted(ApiResponse<StartIndividualRegistrationResponse>.Ok(result, "Verification email sent."));
    }

    /// <summary>
    /// Xác thực email qua mã OTP hoặc Magic Link. Tự động cấp session token và chuyển tiếp.
    /// </summary>
    [HttpPost("{id:guid}/verify")]
    public async Task<ActionResult<ApiResponse<VerifyIndividualRegistrationResponse>>> Verify(
        [FromRoute] Guid id,
        [FromBody] VerifyIndividualRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _commerceService.VerifyRegistrationAsync(id, request, cancellationToken);
        return Ok(ApiResponse<VerifyIndividualRegistrationResponse>.Ok(result, "Account verified."));
    }

    /// <summary>
    /// Yêu cầu gửi lại mã xác thực OTP / link mới. Có giới hạn thời gian chờ (cooldown 60s).
    /// </summary>
    [HttpPost("{id:guid}/resend")]
    public async Task<ActionResult<ApiResponse<ResendIndividualVerificationResponse>>> Resend(
        [FromRoute] Guid id,
        [FromBody] ResendIndividualVerificationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _commerceService.ResendVerificationAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ResendIndividualVerificationResponse>.Ok(result, "Verification email resent."));
    }

    /// <summary>
    /// Lấy trạng thái phiên đăng ký để frontend khôi phục màn hình khi reload.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<IndividualRegistrationStatusResponse>>> GetStatus(
        [FromRoute] Guid id,
        [FromHeader(Name = "X-Registration-Token")] string registrationToken,
        CancellationToken cancellationToken)
    {
        var result = await _commerceService.GetRegistrationStatusAsync(id, registrationToken, cancellationToken);
        return Ok(ApiResponse<IndividualRegistrationStatusResponse>.Ok(result));
    }
}
