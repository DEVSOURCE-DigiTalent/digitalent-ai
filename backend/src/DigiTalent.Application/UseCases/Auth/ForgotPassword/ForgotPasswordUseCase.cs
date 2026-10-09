using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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

        // Tạo token đặt lại mật khẩu ngẫu nhiên an toàn
        var rawToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddMinutes(30);

        // Vô hiệu hóa các token cũ chưa sử dụng của user này
        var oldTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null)
            .ToListAsync();
        foreach (var t in oldTokens)
        {
            t.UsedAt = now;
            t.UpdatedAt = now;
        }

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = rawToken,
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
            // Bỏ qua lỗi gửi email để không chặn response người dùng, đã có log ở SmtpIndividualEmailSender
        }

        var isDev = _configuration["ASPNETCORE_ENVIRONMENT"] == "Development" || _configuration["IndividualCommerce:Security:IsDevelopment"] == "true";
        return new ForgotPasswordOutput
        {
            DebugLink = isDev ? $"/reset-password/{rawToken}" : null
        };
    }
}
