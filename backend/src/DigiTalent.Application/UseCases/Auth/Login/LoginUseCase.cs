using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Đăng nhập bằng email + mật khẩu → trả về token.
/// Sai 5 lần liên tiếp → khóa 15 phút (LoginPolicy). Thông báo sai luôn chung 1 câu.
/// </summary>
public class LoginUseCase : IUseCase<LoginUseCaseInput, LoginUseCaseOutput>
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";
    private const int MaxConcurrencyRetries = 3;

    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginUseCase(IApplicationDbContext context, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginUseCaseOutput> ExecuteAsync(LoginUseCaseInput input)
    {
        var email = input.Email.Trim().ToLower(); // email luôn lưu chữ thường

        // Nhiều request đăng nhập cùng lúc cho 1 tài khoản → request lưu sau bị xung đột (xmin).
        // Nạp lại dữ liệu mới nhất rồi chạy lại, để không lần sai mật khẩu nào bị mất.
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await LoginOnceAsync(email, input.Password);
            }
            catch (DbUpdateConcurrencyException ex) when (attempt < MaxConcurrencyRetries)
            {
                foreach (var entry in ex.Entries)
                {
                    await entry.ReloadAsync();
                }
            }
        }
    }

    private async Task<LoginUseCaseOutput> LoginOnceAsync(string email, string password)
    {
        var now = DateTimeOffset.UtcNow;

        // 1. Tìm user theo email. Không có → 401, không nói email có tồn tại không
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        // 2. Đang bị khóa → từ chối trước khi kiểm tra mật khẩu (chống dò mật khẩu)
        if (user.IsLockedAt(now))
        {
            throw new ForbiddenException("Account is locked. Please try again later or contact the administrator.");
        }

        // 3. Sai mật khẩu → tăng bộ đếm ngay trong database (có thể bị khóa) rồi báo 401
        if (!_passwordHasher.Verify(password, user.PasswordHash))
        {
            await RecordFailedLoginAsync(user.Id, now);
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        // 4. Tài khoản bị vô hiệu hóa
        if (user.Status == Statuses.User.Inactive)
        {
            throw new ForbiddenException("Account is inactive.");
        }

        // 5. Đúng → reset bộ đếm, lấy thông tin nhân viên (nếu có), tạo token chứa các role đang ACTIVE
        user.RegisterSuccessfulLogin(now);

        var employee = await _context.Employees
            .Where(e => e.UserId == user.Id)
            .Select(e => new { e.Id, e.DepartmentId })
            .FirstOrDefaultAsync();

        var roleCodes = user.UserRoles
            .Where(ur => ur.Role!.Status == Statuses.Simple.Active)
            .Select(ur => ur.Role!.Code)
            .ToList();

        var token = _jwtTokenService.CreateToken(user, roleCodes, employee?.Id, employee?.DepartmentId);

        // Lưu RefreshToken vào database (chỉ lưu dạng hash)
        var refreshTokenEntity = new Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashRefreshToken(token.RefreshToken),
            ExpiresAt = token.RefreshTokenExpiresAt,
        };
        _context.RefreshTokens.Add(refreshTokenEntity);

        await _context.SaveChangesAsync();

        return new LoginUseCaseOutput
        {
            AccessToken = token.AccessToken,
            RefreshToken = token.RefreshToken,
            ExpiresAt = token.ExpiresAt,
        };
    }

    /// <summary>
    /// Ghi nhận 1 lần sai mật khẩu bằng câu UPDATE nguyên tử (failed_login_count + 1 ngay trong DB),
    /// nên nhiều request sai song song không bị mất lần đếm nào. Tài khoản INACTIVE không bị đổi trạng thái.
    /// </summary>
    private async Task RecordFailedLoginAsync(Guid userId, DateTimeOffset now)
    {
        var lockedUntil = now.AddMinutes(LoginPolicy.LockoutMinutes);
        var user = _context.Users.Where(u => u.Id == userId && u.Status != Statuses.User.Inactive);

        // 1. Khóa tạm cũ đã hết hạn → mở lại, đếm lại từ 0
        await user
            .Where(u => u.Status == Statuses.User.Locked && u.LockedUntil != null && u.LockedUntil <= now)
            .ExecuteUpdateAsync(set => set
                .SetProperty(u => u.Status, Statuses.User.Active)
                .SetProperty(u => u.LockedUntil, (DateTimeOffset?)null)
                .SetProperty(u => u.FailedLoginCount, 0)
                .SetProperty(u => u.UpdatedAt, now));

        // 2. Tăng bộ đếm
        await user.ExecuteUpdateAsync(set => set
            .SetProperty(u => u.FailedLoginCount, u => u.FailedLoginCount + 1)
            .SetProperty(u => u.UpdatedAt, now));

        // 3. Đủ ngưỡng → khóa tạm (điều kiện >= nên request song song nào tới ngưỡng cũng khóa được)
        await user
            .Where(u => u.Status == Statuses.User.Active && u.FailedLoginCount >= LoginPolicy.MaxFailedAttempts)
            .ExecuteUpdateAsync(set => set
                .SetProperty(u => u.Status, Statuses.User.Locked)
                .SetProperty(u => u.LockedUntil, lockedUntil)
                .SetProperty(u => u.FailedLoginCount, 0)
                .SetProperty(u => u.UpdatedAt, now));
    }
}
