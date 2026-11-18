using System.Net;
using System.Net.Mail;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using DigiTalent.Infrastructure.Email;

namespace DigiTalent.Infrastructure.IndividualCommerce;

public class SmtpIndividualEmailSender : IIndividualEmailSender
{
    private readonly IApplicationDbContext _context;
    private readonly SmtpOptions _smtpOptions;
    private readonly IAppUrlResolver _urlResolver;
    private readonly ILogger<SmtpIndividualEmailSender> _logger;

    public SmtpIndividualEmailSender(
        IApplicationDbContext context,
        IAppUrlResolver urlResolver,
        IOptions<IndividualCommerceOptions> options,
        ILogger<SmtpIndividualEmailSender> logger)
    {
        _context = context;
        _urlResolver = urlResolver;
        _smtpOptions = options.Value.Smtp;
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(
        string recipientEmail,
        string recipientName,
        string otp,
        string verifyLink,
        CancellationToken cancellationToken = default)
    {
        var subject = "Mã xác thực email tài khoản DigiTalent AI";
        var bodyHtml = EmailTemplateBuilder.BuildVerificationOtpEmail(recipientName, otp, 15, verifyLink);

        await SendAndRecordAsync(recipientEmail, "INDIVIDUAL_EMAIL_VERIFICATION", subject, bodyHtml, cancellationToken);
    }

    public async Task SendReceiptEmailAsync(
        string recipientEmail,
        string recipientName,
        string orderCode,
        long amount,
        string planName,
        CancellationToken cancellationToken = default)
    {
        var subject = $"Xác nhận thanh toán thành công đơn hàng #{orderCode} · DigiTalent AI";
        var portalLink = $"{_urlResolver.GetFrontendBaseUrl()}/personal";
        var bodyHtml = EmailTemplateBuilder.BuildPaymentReceiptEmail(recipientName, orderCode, planName, amount, DateTimeOffset.UtcNow, portalLink);

        await SendAndRecordAsync(recipientEmail, "PAYMENT_RECEIPT", subject, bodyHtml, cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(
        string recipientEmail,
        string recipientName,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        var subject = "Yêu cầu đặt lại mật khẩu tài khoản DigiTalent AI";
        var bodyHtml = EmailTemplateBuilder.BuildPasswordResetEmail(recipientName, resetLink, 30);

        await SendAndRecordAsync(recipientEmail, "PASSWORD_RESET", subject, bodyHtml, cancellationToken, throwOnFailure: true);
    }

    private async Task SendAndRecordAsync(
        string recipientEmail,
        string templateName,
        string subject,
        string bodyHtml,
        CancellationToken cancellationToken,
        bool throwOnFailure = false)
    {
        var outboxItem = new EmailOutboxItem
        {
            RecipientEmail = recipientEmail,
            TemplateName = templateName,
            Subject = subject,
            BodyHtml = bodyHtml,
            Status = EmailOutboxStatuses.Queued,
            AttemptCount = 0
        };

        _context.EmailOutboxItems.Add(outboxItem);
        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            using var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
            {
                Credentials = new NetworkCredential(_smtpOptions.UserName, _smtpOptions.Password),
                EnableSsl = _smtpOptions.EnableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_smtpOptions.FromEmail, string.IsNullOrWhiteSpace(_smtpOptions.FromName) ? "DigiTalent AI" : _smtpOptions.FromName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true
            };
            mailMessage.To.Add(recipientEmail);

            await client.SendWithTimeoutAsync(mailMessage, cancellationToken);

            outboxItem.Status = EmailOutboxStatuses.Sent;
            outboxItem.SentAt = DateTimeOffset.UtcNow;
            outboxItem.AttemptCount++;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Sent email {Template} to {Recipient}", templateName, recipientEmail);
        }
        catch (Exception ex)
        {
            outboxItem.Status = EmailOutboxStatuses.Failed;
            outboxItem.AttemptCount++;
            outboxItem.ErrorMessage = ex.Message;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogError(ex, "Failed to send email {Template} to {Recipient}", templateName, recipientEmail);
            if (throwOnFailure) throw;
        }
    }
}
