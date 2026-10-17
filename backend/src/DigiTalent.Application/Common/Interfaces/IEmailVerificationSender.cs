namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Gửi OTP xác minh email cho Business Owner mới đăng ký.
/// Implementation trong Infrastructure (SMTP hoặc logging-only).
/// </summary>
public interface IEmailVerificationSender
{
    /// <summary>
    /// Gửi email chứa OTP 6 số đến <paramref name="toEmail"/>.
    /// Trả về link debug (chỉ trong môi trường Development), null trong production.
    /// </summary>
    Task<string?> SendOtpAsync(
        string toEmail,
        string displayName,
        string otp,
        CancellationToken cancellationToken = default);
}
