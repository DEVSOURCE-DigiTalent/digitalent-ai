using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Lấy thông tin user đang đăng nhập + danh sách quyền.
/// </summary>
public class GetCurrentUserUseCase : IUseCase<GetCurrentUserUseCaseInput, GetCurrentUserUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionReader _permissionReader;

    public GetCurrentUserUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPermissionReader permissionReader)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionReader = permissionReader;
    }

    public async Task<GetCurrentUserUseCaseOutput> ExecuteAsync(GetCurrentUserUseCaseInput input)
    {
        // 1. Lấy user theo Id trong token
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // 2. Lấy mã role của user (bảng user_roles nối qua roles)
        var roleCodes = await _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Code)
            .ToListAsync();

        // 3. Đổi role → danh sách quyền (đọc bảng role_permissions, có cache)
        var permissions = await _permissionReader.GetPermissionsAsync(roleCodes);

        return new GetCurrentUserUseCaseOutput
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.DisplayName,
            Roles = roleCodes,
            Permissions = permissions.OrderBy(p => p).ToList(),
        };
    }
}
