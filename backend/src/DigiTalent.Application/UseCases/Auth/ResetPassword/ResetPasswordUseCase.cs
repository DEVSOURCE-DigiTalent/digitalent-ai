using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

public class ValidateResetTokenUseCase : IUseCase<ValidateResetTokenInput, bool>
{
    private readonly IApplicationDbContext _context;

    public ValidateResetTokenUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExecuteAsync(ValidateResetTokenInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Token))
            throw new BadRequestException("Token không hợp lệ.", "token", "INVALID_TOKEN");

        var tokenRecord = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.TokenHash == input.Token.Trim());

        if (tokenRecord == null || tokenRecord.UsedAt != null || tokenRecord.ExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new BadRequestException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.", "token", "EXPIRED_OR_INVALID_TOKEN");
        }

        return true;
    }
}

public class ResetPasswordUseCase : IUseCase<ResetPasswordInput, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordUseCase(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> ExecuteAsync(ResetPasswordInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Token))
            throw new BadRequestException("Token không hợp lệ.", "token", "INVALID_TOKEN");

        if (string.IsNullOrWhiteSpace(input.Password) || input.Password.Length < 8)
            throw new BadRequestException("Mật khẩu phải có ít nhất 8 ký tự.", "password", "PASSWORD_TOO_SHORT");

        var tokenRecord = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == input.Token.Trim());

        var now = DateTimeOffset.UtcNow;
        if (tokenRecord == null || tokenRecord.UsedAt != null || tokenRecord.ExpiresAt < now)
        {
            throw new BadRequestException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.", "token", "EXPIRED_OR_INVALID_TOKEN");
        }

        var user = tokenRecord.User ?? await _context.Users.FirstOrDefaultAsync(u => u.Id == tokenRecord.UserId);
        if (user == null)
        {
            throw new NotFoundException($"User '{tokenRecord.UserId}' not found.");
        }

        // Cập nhật mật khẩu mới
        user.PasswordHash = _passwordHasher.Hash(input.Password);
        user.UpdatedAt = now;
        user.FailedLoginCount = 0;
        if (user.Status == Statuses.User.Locked)
        {
            user.Status = Statuses.User.Active;
            user.LockedUntil = null;
        }

        // Đánh dấu token đã dùng
        tokenRecord.UsedAt = now;
        tokenRecord.UpdatedAt = now;

        // Thu hồi toàn bộ refresh token cũ để bảo vệ tài khoản
        var activeTokens = await _context.RefreshTokens
            .Where(r => r.UserId == user.Id && r.RevokedAt == null)
            .ToListAsync();
        foreach (var rt in activeTokens)
        {
            rt.RevokedAt = now;
            rt.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
