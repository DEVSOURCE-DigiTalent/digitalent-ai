namespace DigiTalent.Application.IndividualCommerce;

public sealed record PayOSCreatePaymentResult(
    string CheckoutUrl,
    string? QrCode,
    string? PaymentLinkId);

public interface IPayOSService
{
    Task<PayOSCreatePaymentResult> CreatePaymentLinkAsync(
        long orderCode,
        long amount,
        string description,
        string returnUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default);

    bool VerifyWebhookSignature(string dataJson, string signature);
}
