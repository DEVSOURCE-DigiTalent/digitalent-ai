using System.Net;
using System.Net.Mail;
using System.Text.Encodings.Web;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// Gửi OTP xác minh email cho Business Owner mới đăng ký.
/// Nếu SMTP chưa cấu hình: in OTP vào log (Development-only fallback).
/// </summary>
public sealed class EmailVerificationSender : IEmailVerificationSender
{
    private readonly IndividualCommerceOptions _options;
    private readonly ILogger<EmailVerificationSender> _logger;

    public EmailVerificationSender(
        IOptions<IndividualCommerceOptions> options,
        ILogger<EmailVerificationSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string?> SendOtpAsync(
        string toEmail,
        string displayName,
        string otp,
        CancellationToken cancellationToken = default)
    {
        var smtp = _options.Smtp;
        var safeName = HtmlEncoder.Default.Encode(displayName);
        var isDev = _options.Security.IsDevelopment;

        if (string.IsNullOrWhiteSpace(smtp?.Host) ||
            string.IsNullOrWhiteSpace(smtp.UserName) ||
            string.IsNullOrWhiteSpace(smtp.Password) ||
            string.IsNullOrWhiteSpace(smtp.FromEmail))
        {
            if (!isDev)
                throw new InvalidOperationException("SMTP is not configured for email verification.");

            // Development fallback: ghi log, trả OTP để tester dùng ngay
            _logger.LogWarning(
                "[EmailVerificationSender] SMTP chưa cấu hình. OTP cho {Email}: {Otp} (development only)",
                toEmail, otp);
            return otp;
        }

        using var email = new MailMessage
        {
            From = new MailAddress(smtp.FromEmail, smtp.FromName ?? "DigiTalent"),
            Subject = "Mã xác minh tài khoản DigiTalent Pulse",
            IsBodyHtml = true,
            Body = $"""
                    <p>Xin chào <strong>{safeName}</strong>,</p>
                    <p>Mã xác minh email của bạn là:</p>
                    <h2 style="letter-spacing:6px;font-size:36px;font-family:monospace">{otp}</h2>
                    <p>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
                    <hr/>
                    <p style="font-size:12px;color:#666">DigiTalent Pulse &mdash; Nền tảng phát triển năng lực đội ngũ</p>
                    """
        };
        email.To.Add(toEmail);

        using var client = new SmtpClient(smtp.Host, smtp.Port)
        {
            EnableSsl = smtp.EnableSsl,
            Credentials = new NetworkCredential(smtp.UserName, smtp.Password),
        };
        await client.SendMailAsync(email, cancellationToken);
        _logger.LogInformation("[EmailVerificationSender] OTP sent to {Email}", toEmail);
        return null;
    }
}
