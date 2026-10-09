using System.Net;
using System.Net.Mail;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.IndividualCommerce;

public class SmtpIndividualEmailSender : IIndividualEmailSender
{
    private readonly IApplicationDbContext _context;
    private readonly SmtpOptions _smtpOptions;
    private readonly ILogger<SmtpIndividualEmailSender> _logger;

    public SmtpIndividualEmailSender(
        IApplicationDbContext context,
        IOptions<IndividualCommerceOptions> options,
        ILogger<SmtpIndividualEmailSender> logger)
    {
        _context = context;
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
        .otp-box {{ background-color: #f1f5f9; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a; font-family: monospace; }}
        .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; text-align: center; }}
        .footer {{ font-size: 13px; color: #64748b; margin-top: 32px; text-align: center; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='brand'>DigiTalent AI</div>
            <p style='color: #64748b; margin-top: 4px;'>Nền tảng Phát triển Năng lực & Đào tạo AI</p>
        </div>
        <p>Xin chào <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại DigiTalent AI. Để hoàn tất việc kích hoạt tài khoản của bạn, vui lòng nhập mã xác thực OTP 6 chữ số dưới đây:</p>
        
        <div class='otp-box'>
            <div style='font-size: 13px; color: #64748b; margin-bottom: 6px;'>MÃ XÁC THỰC CỦA BẠN</div>
            <div class='otp-code'>{otp}</div>
            <div style='font-size: 12px; color: #94a3b8; margin-top: 6px;'>Mã có hiệu lực trong vòng 15 phút</div>
        </div>

        <p style='text-align: center;'>Hoặc bạn có thể nhấp trực tiếp vào liên kết bên dưới để xác thực tự động:</p>
        <div style='text-align: center;'>
            <a href='{verifyLink}' class='btn'>Xác thực tài khoản ngay</a>
        </div>

        <div class='footer'>
            Nếu bạn không thực hiện yêu cầu này, bạn có thể yên tâm bỏ qua email này.<br/>
            &copy; {DateTime.UtcNow.Year} DigiTalent AI. All rights reserved.
        </div>
    </div>
</body>
</html>";

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
        var subject = $"Xác nhận thanh toán thành công đơn hàng #{orderCode} - DigiTalent AI";
        var formattedAmount = $"{amount:N0} đ";
        var bodyHtml = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
        .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .brand {{ font-size: 24px; font-weight: 700; color: #16a34a; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .info-table td {{ padding: 10px 0; border-bottom: 1px solid #f1f5f9; }}
        .info-table td:last-child {{ text-align: right; font-weight: 600; }}
        .footer {{ font-size: 13px; color: #64748b; margin-top: 32px; text-align: center; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='brand'>Thanh toán thành công!</div>
            <p style='color: #64748b; margin-top: 4px;'>DigiTalent AI đã kích hoạt gói dịch vụ của bạn</p>
        </div>
        <p>Xin chào <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
        <p>Chúng tôi đã nhận được thanh toán cho gói đăng ký học tập của bạn:</p>

        <table class='info-table'>
            <tr><td>Mã đơn hàng:</td><td>#{orderCode}</td></tr>
            <tr><td>Gói dịch vụ:</td><td>{WebUtility.HtmlEncode(planName)}</td></tr>
            <tr><td>Số tiền thanh toán:</td><td style='color: #16a34a;'>{formattedAmount}</td></tr>
            <tr><td>Thời gian:</td><td>{DateTimeOffset.UtcNow:dd/MM/yyyy HH:mm:ss} UTC</td></tr>
        </table>

        <p>Bạn có thể truy cập ngay vào hệ thống để tiếp tục hành trình phát triển kỹ năng của mình!</p>

        <div class='footer'>
            Cảm ơn bạn đã đồng hành cùng DigiTalent AI.<br/>
            Nếu cần hỗ trợ, vui lòng phản hồi email này.
        </div>
    </div>
</body>
</html>";

        await SendAndRecordAsync(recipientEmail, "PAYMENT_RECEIPT", subject, bodyHtml, cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(
        string recipientEmail,
        string recipientName,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        var subject = "Yêu cầu đặt lại mật khẩu tài khoản DigiTalent AI";
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
        .notice {{ background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #92400e; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <div class='brand'>DigiTalent AI</div>
            <p style='color: #64748b; margin-top: 4px;'>Nền tảng Phát triển Năng lực & Đào tạo AI</p>
        </div>
        <p>Xin chào <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại DigiTalent AI.</p>
        <p>Để tạo mật khẩu mới, vui lòng nhấp vào nút bên dưới:</p>

        <div style='text-align: center;'>
            <a href='{resetLink}' class='btn'>Đặt lại mật khẩu</a>
        </div>

        <div class='notice'>
            <strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu có hiệu lực trong vòng <strong>30 phút</strong>. Nếu bạn không yêu cầu hành động này, bạn có thể yên tâm bỏ qua email này. Mật khẩu hiện tại của bạn vẫn an toàn.
        </div>

        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} DigiTalent AI. All rights reserved.
        </div>
    </div>
</body>
</html>";

        await SendAndRecordAsync(recipientEmail, "PASSWORD_RESET", subject, bodyHtml, cancellationToken);
    }

    private async Task SendAndRecordAsync(
        string recipientEmail,
        string templateName,
        string subject,
        string bodyHtml,
        CancellationToken cancellationToken)
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
                From = new MailAddress(_smtpOptions.FromEmail, _smtpOptions.FromName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true
            };
            mailMessage.To.Add(recipientEmail);

            await client.SendMailAsync(mailMessage, cancellationToken);

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
        }
    }
}
