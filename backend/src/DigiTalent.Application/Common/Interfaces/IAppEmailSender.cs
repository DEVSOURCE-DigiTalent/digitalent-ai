namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ gửi email thông báo chung, giao việc, hạn chót và nhắc nhở nhân sự.
/// Sử dụng cấu hình SMTP của hệ thống, xử lý ngoại lệ an toàn để không làm gián đoạn transaction.
/// </summary>
public interface IAppEmailSender
{
    Task<bool> SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default);
}
