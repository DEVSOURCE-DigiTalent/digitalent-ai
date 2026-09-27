using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Đăng nhập bằng email + mật khẩu → trả về token.
/// </summary>
public class LoginUseCase : IUseCase<LoginUseCaseInput, LoginUseCaseOutput>
{
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
        // 1. Tìm user theo email (database so sánh không phân biệt hoa thường)
        var email = input.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        // 2. Sai email HOẶC sai mật khẩu → báo chung 1 câu, không cho biết email có tồn tại không
        if (user == null || !_passwordHasher.Verify(input.Password, user.PasswordHash))
        {
            throw new BadRequestException("Invalid email or password.");
        }

        // 3. Tài khoản phải đang hoạt động và không bị khóa tạm
        if (user.Status != UserStatuses.Active)
        {
            throw new ForbiddenException("Account is not active.");
        }

        if (user.LockedUntil.HasValue && user.LockedUntil.Value > DateTimeOffset.UtcNow)
        {
            throw new ForbiddenException("Account is locked. Please try again later.");
        }

        // 4. Lấy danh sách mã role của user (bảng user_roles nối qua roles)
        var roleCodes = await _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Code)
            .ToListAsync();

        // 5. Ghi nhận lần đăng nhập
        user.LastLoginAt = DateTimeOffset.UtcNow;
        user.FailedLoginCount = 0;
        await _context.SaveChangesAsync();

        // 6. Tạo token (bên trong có Id, email, tổ chức và role của user)
        var token = _jwtTokenService.CreateToken(user, roleCodes);

        return new LoginUseCaseOutput
        {
            AccessToken = token.AccessToken,
            ExpiresAt = token.ExpiresAt,
        };
    }
}
