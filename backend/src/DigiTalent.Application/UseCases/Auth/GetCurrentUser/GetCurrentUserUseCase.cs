using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Lấy thông tin user đang đăng nhập + danh sách quyền.
/// </summary>
public class GetCurrentUserUseCase : IUseCase<GetCurrentUserUseCaseInput, GetCurrentUserUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCurrentUserUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCurrentUserUseCaseOutput> ExecuteAsync(GetCurrentUserUseCaseInput input)
    {
        // 1. Lấy user theo Id trong token
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // 2. Đổi role → danh sách quyền (tra bảng RolePermissions)
        return new GetCurrentUserUseCaseOutput
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = user.Roles,
            Permissions = RolePermissions.GetPermissions(user.Roles),
        };
    }
}
