using System.Net;
using System.Net.Mail;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Email;

public class SmtpAppEmailSender : IAppEmailSender
{
    private readonly SmtpOptions _smtpOptions;
    private readonly ILogger<SmtpAppEmailSender> _logger;

    public SmtpAppEmailSender(
        IOptions<IndividualCommerceOptions> options,
        ILogger<SmtpAppEmailSender> logger)
    {
        _smtpOptions = options.Value.Smtp;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
            return false;

        if (string.IsNullOrWhiteSpace(_smtpOptions.Host) ||
            string.IsNullOrWhiteSpace(_smtpOptions.UserName) ||
            string.IsNullOrWhiteSpace(_smtpOptions.Password))
        {
            _logger.LogWarning("[SmtpAppEmailSender] SMTP not configured. Skipped sending email to {Email}.", toEmail);
            return false;
        }

        try
        {
            using var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
            {
                Credentials = new NetworkCredential(_smtpOptions.UserName, _smtpOptions.Password),
                EnableSsl = _smtpOptions.EnableSsl
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_smtpOptions.FromEmail, string.IsNullOrWhiteSpace(_smtpOptions.FromName) ? "DigiTalent AI" : _smtpOptions.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            var recipient = string.IsNullOrWhiteSpace(toName)
                ? new MailAddress(toEmail.Trim())
                : new MailAddress(toEmail.Trim(), toName.Trim());

            message.To.Add(recipient);

            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("[SmtpAppEmailSender] Successfully sent email '{Subject}' to {Email}.", subject, toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[SmtpAppEmailSender] Failed to send email '{Subject}' to {Email}. Process will continue safely without interruption.", subject, toEmail);
            return false;
        }
    }
}
