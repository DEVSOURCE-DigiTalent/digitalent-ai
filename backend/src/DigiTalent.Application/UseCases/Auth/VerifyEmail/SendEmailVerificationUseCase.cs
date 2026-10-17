using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DigiTalent.Application.UseCases.Auth;

public class SendEmailVerificationInput
{
    /// <summary>Email của tài khoản cần xác minh (phải tồn tại trong bảng users).</summary>
    public string Email { get; set; } = string.Empty;
}

public class SendEmailVerificationOutput
{
    /// <summary>Chỉ có giá trị trong môi trường Development để tester mở nhanh.</summary>
    public string? DebugOtp { get; set; }
}

/// <summary>
/// AUTH-OTP-01: Gửi OTP 6 số qua email để xác minh tài khoản Business Owner vừa đăng ký.
/// Mỗi lần gọi vô hiệu hóa OTP cũ, tạo OTP mới với thời hạn 10 phút.
/// </summary>
public class SendEmailVerificationUseCase : IUseCase<SendEmailVerificationInput, SendEmailVerificationOutput>
{
    private const int OtpLifetimeMinutes = 10;

    private readonly IApplicationDbContext _context;
    private readonly IEmailVerificationSender _sender;
    private readonly IConfiguration _configuration;

    public SendEmailVerificationUseCase(
        IApplicationDbContext context,
        IEmailVerificationSender sender,
        IConfiguration configuration)
    {
        _context = context;
        _sender = sender;
        _configuration = configuration;
    }

    public async Task<SendEmailVerificationOutput> ExecuteAsync(SendEmailVerificationInput input)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        var now = DateTimeOffset.UtcNow;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            throw new NotFoundException("Không tìm thấy tài khoản với email này.");

        // Email đã xác minh rồi → không gửi lại
        if (user.EmailVerifiedAt != null)
            throw new BadRequestException("Email này đã được xác minh.", "email", "ALREADY_VERIFIED");

        // Vô hiệu hóa các OTP cũ (purpose = VERIFY_EMAIL) chưa dùng
        await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id
                        && t.Purpose == TokenPurpose.VerifyEmail
                        && t.UsedAt == null)
            .ExecuteUpdateAsync(set => set
                .SetProperty(t => t.UsedAt, now)
                .SetProperty(t => t.UpdatedAt, now));

        // Sinh OTP 6 số ngẫu nhiên an toàn (không dùng Random, dùng Guid để đủ ngẫu nhiên)
        var otp = GenerateOtp();
        var otpHash = HashOtp(otp);

        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = otpHash,
            Purpose = TokenPurpose.VerifyEmail,
            ExpiresAt = now.AddMinutes(OtpLifetimeMinutes),
            CreatedAt = now,
            UpdatedAt = now,
        };
        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();

        var debugOtp = await _sender.SendOtpAsync(user.Email, user.DisplayName, otp);

        var isDev = _configuration["ASPNETCORE_ENVIRONMENT"] == "Development"
                    || _configuration["IndividualCommerce:Security:IsDevelopment"] == "true";

        return new SendEmailVerificationOutput
        {
            DebugOtp = isDev ? (debugOtp ?? otp) : null,
        };
    }

    /// <summary>OTP 6 chữ số (000000-999999), đủ ngẫu nhiên bằng cryptographic random.</summary>
    private static string GenerateOtp()
    {
        var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(4);
        var value = BitConverter.ToUInt32(bytes, 0) % 1_000_000;
        return value.ToString("D6");
    }

    /// <summary>SHA-256 hex của OTP để không lưu plaintext trong DB.</summary>
    public static string HashOtp(string otp)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(otp));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
