using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

public class VerifyBusinessEmailInput
{
    /// <summary>Email tài khoản cần xác minh.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>OTP 6 số người dùng nhập từ email.</summary>
    public string Otp { get; set; } = string.Empty;
}

public class VerifyBusinessEmailOutput
{
    public bool Verified { get; set; }
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// AUTH-OTP-02: Xác minh OTP 6 số cho Business Owner.
/// Sau khi verify thành công: EmailVerifiedAt = now, Status = ACTIVE.
/// </summary>
public class VerifyBusinessEmailUseCase : IUseCase<VerifyBusinessEmailInput, VerifyBusinessEmailOutput>
{
    private readonly IApplicationDbContext _context;

    public VerifyBusinessEmailUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<VerifyBusinessEmailOutput> ExecuteAsync(VerifyBusinessEmailInput input)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        var otp = input.Otp.Trim();

        if (otp.Length != 6 || !otp.All(char.IsDigit))
            throw new BadRequestException("OTP phải là 6 chữ số.", "otp", "INVALID_OTP_FORMAT");

        var now = DateTimeOffset.UtcNow;
        var otpHash = SendEmailVerificationUseCase.HashOtp(otp);

        // Tìm user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            throw new NotFoundException("Không tìm thấy tài khoản.");

        // Đã xác minh rồi
        if (user.EmailVerifiedAt != null)
            throw new BadRequestException("Email đã được xác minh trước đó.", "email", "ALREADY_VERIFIED");

        // Tìm OTP token hợp lệ
        var token = await _context.PasswordResetTokens.FirstOrDefaultAsync(t =>
            t.UserId == user.Id
            && t.Purpose == TokenPurpose.VerifyEmail
            && t.TokenHash == otpHash
            && t.UsedAt == null
            && t.ExpiresAt >= now);

        if (token == null)
            throw new BadRequestException(
                "Mã OTP không đúng hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
                "otp",
                "INVALID_OR_EXPIRED_OTP");

        // Đánh dấu token đã dùng
        token.UsedAt = now;
        token.UpdatedAt = now;

        // Kích hoạt tài khoản
        user.EmailVerifiedAt = now;
        user.Status = Statuses.User.Active;
        user.UpdatedAt = now;

        await _context.SaveChangesAsync();

        return new VerifyBusinessEmailOutput
        {
            Verified = true,
            Email = user.Email,
        };
    }
}
