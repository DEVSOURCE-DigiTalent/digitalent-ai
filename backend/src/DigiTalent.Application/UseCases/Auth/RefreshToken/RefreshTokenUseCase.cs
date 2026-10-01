using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Xoay vòng Refresh Token (Token Rotation):
/// 1. Kiểm tra tính hợp lệ của refresh token nhận vào (dạng hash).
/// 2. Nếu token đã bị thu hồi trước đó -> Phát hiện gian lận/tái sử dụng, thu hồi toàn bộ token của user.
/// 3. Nếu hợp lệ -> Thu hồi token cũ, phát hành Access Token mới và Refresh Token mới.
/// </summary>
public class RefreshTokenUseCase : IUseCase<RefreshTokenUseCaseInput, RefreshTokenUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public RefreshTokenUseCase(IApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<RefreshTokenUseCaseOutput> ExecuteAsync(RefreshTokenUseCaseInput input)
    {
        var now = DateTimeOffset.UtcNow;
        var tokenHash = _jwtTokenService.HashRefreshToken(input.RefreshToken);

        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (existingToken == null)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        // Phát hiện tái sử dụng token đã thu hồi (Token Reuse Detection)
        if (existingToken.RevokedAt != null)
        {
            // Thu hồi toàn bộ token còn hiệu lực của user để ngăn chặn tấn công chiếm quyền
            await _context.RefreshTokens
                .Where(t => t.UserId == existingToken.UserId && t.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));

            throw new UnauthorizedException("Refresh token was previously revoked. Suspicious activity detected.");
        }

        // Kiểm tra hết hạn
        if (existingToken.ExpiresAt <= now)
        {
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        // Lấy thông tin user
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == existingToken.UserId);

        if (user == null || user.Status != Statuses.User.Active)
        {
            throw new UnauthorizedException("User account is inactive or not found.");
        }

        if (user.IsLockedAt(now))
        {
            throw new ForbiddenException("Account is locked.");
        }

        // Lấy thông tin nhân viên
        var employee = await _context.Employees
            .Where(e => e.UserId == user.Id)
            .Select(e => new { e.Id, e.DepartmentId })
            .FirstOrDefaultAsync();

        var roleCodes = user.UserRoles
            .Where(ur => ur.Role!.Status == Statuses.Simple.Active)
            .Select(ur => ur.Role!.Code)
            .ToList();

        // Thu hồi token cũ
        existingToken.RevokedAt = now;

        // Sinh token mới
        var newToken = _jwtTokenService.CreateToken(user, roleCodes, employee?.Id, employee?.DepartmentId);

        var newRefreshTokenEntity = new Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashRefreshToken(newToken.RefreshToken),
            ExpiresAt = newToken.RefreshTokenExpiresAt,
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        existingToken.ReplacedByTokenId = newRefreshTokenEntity.Id;

        await _context.SaveChangesAsync();

        return new RefreshTokenUseCaseOutput
        {
            AccessToken = newToken.AccessToken,
            RefreshToken = newToken.RefreshToken,
            ExpiresAt = newToken.ExpiresAt,
        };
    }
}
