using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/individual")]
public class IndividualCommerceController : ControllerBase
{
    private readonly IndividualCommerceService _commerceService;
    private readonly ICurrentUser _currentUser;

    public IndividualCommerceController(
        IndividualCommerceService commerceService,
        ICurrentUser currentUser)
    {
        _commerceService = commerceService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Tạo đơn hàng nháp (Purchase Draft) khi người dùng chọn gói và chu kỳ thanh toán.
    /// </summary>
    [HttpPost("purchase-drafts")]
    public async Task<ActionResult<ApiResponse<PurchaseDraftDto>>> CreatePurchaseDraft(
        [FromBody] CreatePurchaseDraftRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.CreatePurchaseDraftAsync(_currentUser.UserId.Value, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<PurchaseDraftDto>.Ok(result, "Purchase draft created."));
    }

    /// <summary>
    /// Lấy thông tin đơn hàng nháp theo Id.
    /// </summary>
    [HttpGet("purchase-drafts/{id:guid}")]
    public async Task<ActionResult<ApiResponse<PurchaseDraftDto>>> GetPurchaseDraft(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.GetPurchaseDraftAsync(_currentUser.UserId.Value, id, cancellationToken);
        return Ok(ApiResponse<PurchaseDraftDto>.Ok(result));
    }

    /// <summary>
    /// Lấy đơn hàng nháp đang có hiệu lực gần nhất của người dùng.
    /// </summary>
    [HttpGet("purchase-drafts/active")]
    public async Task<ActionResult<ApiResponse<PurchaseDraftDto?>>> GetActivePurchaseDraft(
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.GetActivePurchaseDraftAsync(_currentUser.UserId.Value, cancellationToken);
        return Ok(ApiResponse<PurchaseDraftDto?>.Ok(result));
    }

    /// <summary>
    /// Lấy đơn thanh toán đang chờ xử lý gần nhất của người dùng.
    /// </summary>
    [HttpGet("orders/active")]
    public async Task<ActionResult<ApiResponse<IndividualOrderDto?>>> GetActiveOrder(
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.GetActiveOrderAsync(_currentUser.UserId.Value, cancellationToken);
        return Ok(ApiResponse<IndividualOrderDto?>.Ok(result));
    }

    /// <summary>
    /// Tạo đơn thanh toán và lấy mã VietQR PayOS để khách quét chuyển khoản.
    /// </summary>
    [HttpPost("orders")]
    public async Task<ActionResult<ApiResponse<IndividualOrderDto>>> CreateOrder(
        [FromBody] CreateIndividualOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.CreateOrderAsync(_currentUser.UserId.Value, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<IndividualOrderDto>.Ok(result, "Payment order created."));
    }

    /// <summary>
    /// Kiểm tra trạng thái đơn thanh toán (dùng để polling từ trang checkout).
    /// </summary>
    [HttpGet("orders/{id:guid}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<ActionResult<ApiResponse<IndividualOrderDto>>> GetOrder(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.GetOrderAsync(_currentUser.UserId.Value, id, cancellationToken);
        return Ok(ApiResponse<IndividualOrderDto>.Ok(result));
    }

    /// <summary>
    /// Lấy thông tin gói dịch vụ hiện tại của tài khoản cá nhân.
    /// </summary>
    [HttpGet("subscription")]
    public async Task<ActionResult<ApiResponse<IndividualSubscriptionDto?>>> GetSubscription(
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var result = await _commerceService.GetUserSubscriptionAsync(_currentUser.UserId.Value, cancellationToken);
        return Ok(ApiResponse<IndividualSubscriptionDto?>.Ok(result));
    }
}
