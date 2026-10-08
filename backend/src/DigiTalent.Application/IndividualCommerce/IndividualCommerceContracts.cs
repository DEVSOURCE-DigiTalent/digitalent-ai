using System.Text.Json.Nodes;

namespace DigiTalent.Application.IndividualCommerce;

public sealed record PlanSelectionDto(string PlanCode, string Cycle);

public sealed record StartIndividualRegistrationRequest(
    string FullName,
    string Email,
    string Password,
    bool AcceptTerms,
    string Intent,
    string? Source,
    string? PositionCode,
    JsonObject? TryOrientation,
    PlanSelectionDto? PlanSelection);

public sealed record StartIndividualRegistrationResponse(
    Guid RegistrationId,
    string MaskedEmail,
    string State,
    DateTimeOffset VerificationExpiresAt,
    DateTimeOffset ResendAvailableAt,
    string RegistrationAccessToken,
    string DeliveryStatus,
    string? DevelopmentVerifyLink = null,
    string? DevelopmentOtp = null);

public sealed record VerifyIndividualRegistrationRequest(
    string? RegistrationAccessToken,
    string? Otp,
    string? MagicLinkToken);

public sealed record IndividualUserSessionDto(
    Guid Id,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions,
    string Workspace,
    bool EmailVerified,
    string OnboardingStatus,
    IndividualSubscriptionDto? Subscription);

public sealed record IndividualSubscriptionDto(
    string PlanCode,
    string PlanName,
    string Status,
    DateTimeOffset? TrialStartedAt = null,
    DateTimeOffset? TrialEndsAt = null,
    int? TrialCourseLimit = null,
    DateTimeOffset? CurrentPeriodStart = null,
    DateTimeOffset? CurrentPeriodEnd = null);

public sealed record VerifyIndividualRegistrationResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset ExpiresAt,
    IndividualUserSessionDto User,
    string NextPath,
    PurchaseDraftDto? PurchaseDraft = null);

public sealed record ResendIndividualVerificationRequest(string RegistrationAccessToken);

public sealed record ResendIndividualVerificationResponse(
    Guid RegistrationId,
    string MaskedEmail,
    DateTimeOffset VerificationExpiresAt,
    DateTimeOffset ResendAvailableAt,
    string? DevelopmentVerifyLink = null);

public sealed record IndividualRegistrationStatusResponse(
    Guid RegistrationId,
    string MaskedEmail,
    string State,
    DateTimeOffset ExpiresAt,
    DateTimeOffset ResendAvailableAt);

public sealed record IndividualPlanPriceDto(string Cycle, long Amount);

public sealed record IndividualPlanDto(
    string Code,
    string Name,
    string Description,
    bool Purchasable,
    bool Recommended,
    IReadOnlyList<IndividualPlanPriceDto> Prices,
    IReadOnlyList<string> Entitlements,
    IReadOnlyList<string> Highlights);

public sealed record IndividualPlanCatalogDto(
    string PricingVersion,
    string Currency,
    IReadOnlyList<IndividualPlanDto> Plans);

public sealed record CreatePurchaseDraftRequest(string PlanCode, string Cycle);

public sealed record PurchaseDraftDto(
    Guid Id,
    string PlanCode,
    string Cycle,
    long Amount,
    string Currency,
    string PricingVersion,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

public sealed record CreateIndividualOrderRequest(Guid PurchaseDraftId, string PaymentMethod = "BANK_QR");

public sealed record IndividualOrderPaymentDto(
    string Method,
    string? QrPayload,
    string? CheckoutUrl,
    string TransferContent);

public sealed record IndividualOrderDto(
    Guid Id,
    string Code,
    long OrderCode,
    string Purpose,
    string PlanCode,
    string Cycle,
    long Amount,
    string Currency,
    string Status,
    IndividualOrderPaymentDto Payment,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

public sealed class PayOSWebhookRequest
{
    public string Code { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public PayOSWebhookData Data { get; set; } = new();
    public string Signature { get; set; } = string.Empty;
}

public sealed class PayOSWebhookData
{
    public long OrderCode { get; set; }
    public long Amount { get; set; }
    public string? Description { get; set; }
    public string? AccountNumber { get; set; }
    public string? Reference { get; set; }
    public string? TransactionDateTime { get; set; }
    public string? Currency { get; set; }
    public string? PaymentLinkId { get; set; }
    public string? Code { get; set; }
    public string? Desc { get; set; }
    public string? CounterAccountBankId { get; set; }
    public string? CounterAccountBankName { get; set; }
    public string? CounterAccountName { get; set; }
    public string? CounterAccountNumber { get; set; }
    public string? VirtualAccountName { get; set; }
    public string? VirtualAccountNumber { get; set; }
}
