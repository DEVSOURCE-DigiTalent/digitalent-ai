using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Authorization;

/// <summary>
/// Đọc ma trận quyền từ database. Đăng ký Scoped → mỗi request chỉ query 1 lần rồi nhớ lại.
/// Role bị INACTIVE thì không mang quyền nào.
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly IApplicationDbContext _context;
    private readonly Dictionary<string, IReadOnlyCollection<string>> _cache = new();

    public PermissionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<string>> GetPermissionsAsync(IReadOnlyCollection<string> roleCodes)
    {
        var cacheKey = string.Join(',', roleCodes.OrderBy(code => code));
        if (_cache.TryGetValue(cacheKey, out var cached))
        {
            return cached;
        }

        var permissions = roleCodes.Contains(Roles.SystemAdmin)
            ? await _context.Permissions
                .Select(p => p.Code)
                .ToListAsync()
            : await _context.RolePermissions
                .Where(rp => roleCodes.Contains(rp.Role!.Code) && rp.Role.Status == Statuses.Simple.Active)
                .Select(rp => rp.Permission!.Code)
                .Distinct()
                .ToListAsync();

        _cache[cacheKey] = permissions;
        return permissions;
    }

    public async Task<bool> HasAnyAsync(IReadOnlyCollection<string> roleCodes, IReadOnlyCollection<string> permissions)
    {
        if (roleCodes.Contains(Roles.SystemAdmin))
        {
            return true;
        }

        var granted = await GetPermissionsAsync(roleCodes);
        return permissions.Any(granted.Contains);
    }

    public async Task<bool> IsAccountUsableAsync(Guid userId)
    {
        var now = DateTimeOffset.UtcNow;
        var account = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new { u.Status, u.LockedUntil })
            .FirstOrDefaultAsync();

        if (account == null || account.Status == Statuses.User.Inactive)
        {
            return false;
        }

        var isLocked = account.Status == Statuses.User.Locked
            && (account.LockedUntil == null || account.LockedUntil > now);
        return !isLocked;
    }
}
