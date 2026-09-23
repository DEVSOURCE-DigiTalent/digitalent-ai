using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
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
        // 1. Tìm user theo email (email luôn lưu chữ thường)
        var email = input.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // 2. Sai email HOẶC sai mật khẩu → báo chung 1 câu, không cho biết email có tồn tại không
        if (user == null || !_passwordHasher.Verify(input.Password, user.PasswordHash))
        {
            throw new BadRequestException("Invalid email or password.");
        }

        // 3. Tài khoản bị khóa thì không cho đăng nhập
        if (!user.IsActive)
        {
            throw new ForbiddenException("Account is disabled.");
        }

        // 4. Tạo token (bên trong có Id, email, role của user)
        var token = _jwtTokenService.CreateToken(user);

        return new LoginUseCaseOutput
        {
            AccessToken = token.AccessToken,
            ExpiresAt = token.ExpiresAt,
        };
    }
}
