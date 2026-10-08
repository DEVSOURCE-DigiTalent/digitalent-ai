using System.Net;
using System.Net.Mail;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Application.Trial;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Trial;

public sealed class SmtpTrialEmailSender : ITrialEmailSender
{
    private readonly SmtpOptions _smtpOptions;
    private readonly TrialOptions _trialOptions;
    private readonly ILogger<SmtpTrialEmailSender> _logger;

    public bool IsReady => !string.IsNullOrWhiteSpace(_smtpOptions.Host) &&
                           !string.IsNullOrWhiteSpace(_smtpOptions.UserName) &&
                           !string.IsNullOrWhiteSpace(_smtpOptions.Password);

    public SmtpTrialEmailSender(
        IOptions<IndividualCommerceOptions> options,
        TrialOptions trialOptions,
        ILogger<SmtpTrialEmailSender> logger)
    {
        _smtpOptions = options.Value.Smtp;
        _trialOptions = trialOptions;
        _logger = logger;
    }

    public async Task SendAsync(string email, string kind, string token, CancellationToken ct = default)
    {
        if (!IsReady)
        {
            throw new InvalidOperationException("SMTP settings are not configured for trial emails.");
        }

        var publicUrl = _trialOptions.PublicAppUrl.TrimEnd('/');
        var isVerify = string.Equals(kind, "verify", StringComparison.OrdinalIgnoreCase);
        var actionUrl = isVerify
            ? $"{publicUrl}/business/try/verify?token={Uri.EscapeDataString(token)}"
            : $"{publicUrl}/business/try/accept?token={Uri.EscapeDataString(token)}";

        var subject = isVerify
            ? "Xác minh tài khoản dùng thử doanh nghiệp — DigiTalent AI"
            : "Lời mời tham gia dùng thử doanh nghiệp — DigiTalent AI";

        var heading = isVerify
            ? "Xác minh tài khoản dùng thử doanh nghiệp"
            : "Lời mời tham gia không gian doanh nghiệp";

        var bodyContent = isVerify
            ? "Cảm ơn bạn đã đăng ký trải nghiệm dùng thử DigiTalent AI cho doanh nghiệp. Vui lòng nhấn vào nút bên dưới để xác minh tài khoản và bắt đầu thiết lập tổ chức của bạn:"
            : "Bạn vừa nhận được lời mời tham gia vào không gian dùng thử DigiTalent AI của tổ chức. Nhấn vào nút bên dưới để chấp nhận lời mời và truy cập:";

        var buttonText = isVerify ? "Xác minh tài khoản ngay" : "Tham gia không gian dùng thử";

        var bodyHtml = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
        .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .brand {{ font-size: 24px; font-weight: 700; color: #4338ca; }}
        .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; text-align: center; }}
        .footer {{ font-size: 13px; color: #64748b; margin-top: 32px; text-align: center; line-height: 1.5; }}
        .note {{ font-size: 13px; color: #64748b; background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin-top: 20px; word-break: break-all; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='brand'>DigiTalent AI</div>
            <p style='color: #64748b; margin-top: 4px;'>Nền tảng Đào tạo & Đánh giá Năng lực Số Doanh nghiệp</p>
        </div>
        <h3>{heading}</h3>
        <p>{bodyContent}</p>
        <div style='text-align: center;'>
            <a href='{actionUrl}' class='btn'>{buttonText}</a>
        </div>
        <div class='note'>
            Nếu nút bấm không hoạt động, bạn có thể sao chép liên kết sau vào trình duyệt:<br>
            <a href='{actionUrl}'>{actionUrl}</a>
        </div>
        <div class='footer'>
            Email này được gửi tự động từ hệ thống DigiTalent AI.<br>
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
        </div>
    </div>
</body>
</html>";

        using var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
        {
            Credentials = new NetworkCredential(_smtpOptions.UserName, _smtpOptions.Password),
            EnableSsl = _smtpOptions.EnableSsl
        };

        using var message = new MailMessage
        {
            From = new MailAddress(_smtpOptions.FromEmail, _smtpOptions.FromName),
            Subject = subject,
            Body = bodyHtml,
            IsBodyHtml = true
        };

        message.To.Add(email);
        await client.SendMailAsync(message, ct);
        _logger.LogInformation("Sent trial {Kind} email to {Email}", kind, email);
    }
}
