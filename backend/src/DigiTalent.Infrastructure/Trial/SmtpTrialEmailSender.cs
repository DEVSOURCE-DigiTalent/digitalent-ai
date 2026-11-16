using System.Net;
using System.Net.Mail;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Application.Trial;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Trial;

public sealed class SmtpTrialEmailSender : ITrialEmailSender
{
    private readonly SmtpOptions _smtpOptions;
    private readonly TrialOptions _trialOptions;
    private readonly IAppUrlResolver _urlResolver;
    private readonly ILogger<SmtpTrialEmailSender> _logger;

    public bool IsReady => !string.IsNullOrWhiteSpace(_smtpOptions.Host) &&
                           !string.IsNullOrWhiteSpace(_smtpOptions.UserName) &&
                           !string.IsNullOrWhiteSpace(_smtpOptions.Password) &&
                           !string.IsNullOrWhiteSpace(_smtpOptions.FromEmail);

    public bool IsDevelopmentCapture => _trialOptions.DevelopmentEnvironment && _trialOptions.EnableDevelopmentCapture;

    public SmtpTrialEmailSender(
        IOptions<IndividualCommerceOptions> options,
        TrialOptions trialOptions,
        IAppUrlResolver urlResolver,
        ILogger<SmtpTrialEmailSender> logger)
    {
        _smtpOptions = options.Value.Smtp;
        _trialOptions = trialOptions;
        _urlResolver = urlResolver;
        _logger = logger;
    }

    public Task SendAsync(string email, string kind, string token, CancellationToken ct = default)
        => SendCoreAsync(email, kind, token, null, ct);

    public Task SendVerificationCodeAsync(string email, string token, string code, CancellationToken ct = default)
        => SendCoreAsync(email, "verify", token, code, ct);

    private async Task SendCoreAsync(string email, string kind, string token, string? code, CancellationToken ct)
    {
        if (!IsReady)
        {
            throw new InvalidOperationException("SMTP settings are not configured for trial emails.");
        }

        var publicUrl = _urlResolver.GetFrontendBaseUrl();
        var isVerify = string.Equals(kind, "verify", StringComparison.OrdinalIgnoreCase);
        var actionUrl = isVerify
            ? $"{publicUrl}/business/try/verify?token={Uri.EscapeDataString(token)}"
            : $"{publicUrl}/business/try/accept?token={Uri.EscapeDataString(token)}";

        var subject = isVerify
            ? "Xác minh tài khoản dùng thử doanh nghiệp · DigiTalent AI"
            : "Lời mời tham gia dùng thử doanh nghiệp · DigiTalent AI";

        var bodyHtml = EmailTemplateBuilder.BuildTrialEmail(email, actionUrl, isVerify, code);

        using var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
        {
            Credentials = new NetworkCredential(_smtpOptions.UserName, _smtpOptions.Password),
            EnableSsl = _smtpOptions.EnableSsl
        };

        using var mail = new MailMessage
        {
            From = new MailAddress(_smtpOptions.FromEmail, string.IsNullOrWhiteSpace(_smtpOptions.FromName) ? "DigiTalent AI" : _smtpOptions.FromName),
            Subject = subject,
            Body = bodyHtml,
            IsBodyHtml = true
        };
        mail.To.Add(email);

        try
        {
            await client.SendMailAsync(mail, ct);
            _logger.LogInformation("[SmtpTrialEmailSender] Successfully sent trial {Kind} email to {Email}.", kind, email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[SmtpTrialEmailSender] Failed to send trial {Kind} email to {Email} via SMTP. In Development mode, proceeding with fallback capture.", kind, email);
            if (!IsDevelopmentCapture)
            {
                throw;
            }
        }
    }
}
