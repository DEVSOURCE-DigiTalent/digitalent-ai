using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Lấy thông tin user đang đăng nhập + role + danh sách quyền (đọc từ database).
/// </summary>
public class GetCurrentUserUseCase : IUseCase<GetCurrentUserUseCaseInput, GetCurrentUserUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionService _permissionService;

    public GetCurrentUserUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPermissionService permissionService)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionService = permissionService;
    }

    public async Task<GetCurrentUserUseCaseOutput> ExecuteAsync(GetCurrentUserUseCaseInput input)
    {
        // 1. Lấy user theo Id trong token, kèm role đang ACTIVE và hồ sơ nhân sự (nếu có)
        var user = await _context.Users
            .Where(u => u.Id == _currentUser.UserId)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.DisplayName,
                u.OrganizationId,
                Roles = u.UserRoles
                    .Where(ur => ur.Role!.Status == Statuses.Simple.Active)
                    .Select(ur => ur.Role!.Code)
                    .ToList(),
                EmployeeId = _context.Employees
                    .Where(e => e.UserId == u.Id)
                    .Select(e => (Guid?)e.Id)
                    .FirstOrDefault(),
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // 2. Đổi role → danh sách quyền (bảng role_permissions)
        var permissions = await _permissionService.GetPermissionsAsync(user.Roles);
        var trial = user.OrganizationId == null ? null : await _context.TrialWorkspaces
            .AsNoTracking().SingleOrDefaultAsync(x => x.OrganizationId == user.OrganizationId);

        return new GetCurrentUserUseCaseOutput
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.DisplayName,
            EmployeeId = user.EmployeeId,
            OrganizationId = user.OrganizationId,
            EnterpriseTrialStatus = trial == null ? null : trial.ConvertedAt != null ? "converted" : DateTimeOffset.UtcNow < trial.EndsAt ? "trial_active" : "trial_read_only",
            Roles = user.Roles,
            Permissions = permissions.ToList(),
        };
    }
}
