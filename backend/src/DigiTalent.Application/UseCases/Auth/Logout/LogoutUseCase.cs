using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

public class LogoutUseCase : IUseCase<LogoutUseCaseInput, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public LogoutUseCase(IApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<bool> ExecuteAsync(LogoutUseCaseInput input)
    {
        var tokenHash = _jwtTokenService.HashRefreshToken(input.RefreshToken);
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (token != null && token.RevokedAt == null)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        return true;
    }
}
