using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

public class VerifyEmailInput
{
    public string Token { get; set; } = string.Empty;
}

public class VerifyEmailUseCase : IUseCase<VerifyEmailInput, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IOtpHashingService _otpHashing;

    public VerifyEmailUseCase(IApplicationDbContext context, IOtpHashingService otpHashing)
    {
        _context = context;
        _otpHashing = otpHashing;
    }

    public async Task<bool> ExecuteAsync(VerifyEmailInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Token))
            throw new BadRequestException("Token xác minh không hợp lệ.", "token", "INVALID_TOKEN");

        var now = DateTimeOffset.UtcNow;
        var token = input.Token.Trim();
        var hashedToken = _otpHashing.HashToken(token);

        // 1. Kiểm tra registration email verification challenge
        var challenge = await _context.IndividualEmailVerificationChallenges
            .Include(c => c.Registration)
            .FirstOrDefaultAsync(c => (c.MagicTokenHash == hashedToken || c.MagicTokenHash == token) && c.ConsumedAt == null && c.ExpiresAt >= now);

        if (challenge != null)
        {
            challenge.ConsumedAt = now;
            challenge.UpdatedAt = now;
            if (challenge.Registration != null)
            {
                challenge.Registration.State = "COMPLETED";
                challenge.Registration.UpdatedAt = now;
                var regUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == challenge.Registration.Email);
                if (regUser != null)
                {
                    regUser.EmailVerifiedAt = now;
                    regUser.UpdatedAt = now;
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // 2. Kiểm tra token trong password reset / verify token
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == token && t.UsedAt == null && t.ExpiresAt >= now);

        if (resetToken != null)
        {
            resetToken.UsedAt = now;
            resetToken.UpdatedAt = now;
            var user = resetToken.User ?? await _context.Users.FirstOrDefaultAsync(u => u.Id == resetToken.UserId);
            if (user != null)
            {
                user.EmailVerifiedAt = now;
                user.UpdatedAt = now;
            }
            await _context.SaveChangesAsync();
            return true;
        }

        throw new BadRequestException("Liên kết xác minh không hợp lệ hoặc đã hết hạn.", "token", "EXPIRED_OR_INVALID_TOKEN");
    }
}
