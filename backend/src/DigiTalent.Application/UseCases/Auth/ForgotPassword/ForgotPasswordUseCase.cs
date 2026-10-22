using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace DigiTalent.Application.UseCases.Auth;

public class ForgotPasswordUseCase : IUseCase<ForgotPasswordInput, ForgotPasswordOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IIndividualEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public ForgotPasswordUseCase(
        IApplicationDbContext context,
        IIndividualEmailSender emailSender,
        IConfiguration configuration)
    {
        _context = context;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<ForgotPasswordOutput> ExecuteAsync(ForgotPasswordInput input)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return new ForgotPasswordOutput();
        }

        var now = DateTimeOffset.UtcNow;
        if (await _context.PasswordResetTokens.AnyAsync(t => t.UserId == user.Id && t.Purpose == TokenPurpose.ResetPassword
            && t.UsedAt == null && t.CreatedAt > now.AddMinutes(-1)))
            return new ForgotPasswordOutput();

        // Tạo token đặt lại mật khẩu ngẫu nhiên an toàn
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var expiresAt = now.AddMinutes(30);

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = PasswordResetTokenHasher.Hash(rawToken),
            ExpiresAt = expiresAt,
            CreatedAt = now,
            UpdatedAt = now,
        };
        _context.PasswordResetTokens.Add(resetToken);
        await _context.SaveChangesAsync();

        var frontendBaseUrl = _configuration["IndividualCommerce:Security:PublicAppUrl"] ?? "http://localhost:5173";
        var resetLink = $"{frontendBaseUrl.TrimEnd('/')}/reset-password/{rawToken}";

        try
        {
            await _emailSender.SendPasswordResetEmailAsync(
                user.Email,
                string.IsNullOrWhiteSpace(user.DisplayName) ? "Người dùng" : user.DisplayName,
                resetLink);
        }
        catch
        {
            // A failed delivery cannot invalidate an older usable link.
            _context.PasswordResetTokens.Remove(resetToken);
            await _context.SaveChangesAsync();
            return new ForgotPasswordOutput();
        }

        var oldTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.Id != resetToken.Id && t.UsedAt == null && t.Purpose == TokenPurpose.ResetPassword)
            .ToListAsync();
        foreach (var oldToken in oldTokens)
        {
            oldToken.UsedAt = now;
            oldToken.UpdatedAt = now;
        }
        await _context.SaveChangesAsync();
        return new ForgotPasswordOutput();
    }
}
