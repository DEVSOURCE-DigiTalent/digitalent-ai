using System.Text.Json;
using DigiTalent.Api.Common;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/payment-webhooks")]
public class PaymentWebhooksController : ControllerBase
{
    private readonly IndividualCommerceService _commerceService;
    private readonly ILogger<PaymentWebhooksController> _logger;

    public PaymentWebhooksController(
        IndividualCommerceService commerceService,
        ILogger<PaymentWebhooksController> logger)
    {
        _commerceService = commerceService;
        _logger = logger;
    }

    /// <summary>
    /// Webhook tiếp nhận thông báo thanh toán thành công từ cổng PayOS.
    /// Tự động xác thực chữ ký số HMAC-SHA256 và kích hoạt gói học.
    /// </summary>
    [HttpPost("payos")]
    public async Task<IActionResult> HandlePayosWebhook(CancellationToken cancellationToken)
    {
        string rawBody;
        using (var reader = new StreamReader(Request.Body))
        {
            rawBody = await reader.ReadToEndAsync(cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(rawBody))
        {
            return BadRequest(ApiResponse<object?>.Fail("Empty payload."));
        }

        PayOSWebhookRequest? webhookRequest;
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            webhookRequest = JsonSerializer.Deserialize<PayOSWebhookRequest>(rawBody, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize PayOS webhook payload");
            return BadRequest(ApiResponse<object?>.Fail("Invalid JSON payload."));
        }

        if (webhookRequest == null)
        {
            return BadRequest(ApiResponse<object?>.Fail("Invalid webhook payload."));
        }

        var success = await _commerceService.HandlePayOSWebhookAsync(webhookRequest, rawBody, cancellationToken);
        if (!success)
        {
            return BadRequest(ApiResponse<object?>.Fail("Webhook processing failed or invalid signature."));
        }

        return Ok(ApiResponse<object?>.Ok(null, "Webhook processed successfully."));
    }
}
