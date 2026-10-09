namespace DigiTalent.Application.IndividualCommerce;

public interface IIndividualEmailSender
{
    Task SendVerificationEmailAsync(string recipientEmail, string recipientName, string otp, string verifyLink, CancellationToken cancellationToken = default);
    Task SendReceiptEmailAsync(string recipientEmail, string recipientName, string orderCode, long amount, string planName, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string recipientEmail, string recipientName, string resetLink, CancellationToken cancellationToken = default);
}
