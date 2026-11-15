using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// Đọc quyền của từng role từ database (roles → role_permissions → permissions).
/// Cache 5 phút để mỗi request không phải query lại.
/// Đổi quyền trong DB thì tối đa 5 phút sau là có hiệu lực, user không cần đăng nhập lại.
/// </summary>
public class PermissionReader : IPermissionReader
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    public PermissionReader(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<HashSet<string>> GetPermissionsAsync(IEnumerable<string> roleCodes)
    {
        var permissions = new HashSet<string>();

        foreach (var roleCode in roleCodes.Distinct())
        {
            var ofRole = await _cache.GetOrCreateAsync($"permissions:{roleCode}", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;

                return await _context.RolePermissions
                    .Where(rp => rp.Role.Code == roleCode)
                    // Existing databases may still contain the former manager grant.
                    .Where(rp => roleCode != Roles.Manager || rp.Permission.Code != Permissions.Task.Evaluate)
                    .Select(rp => rp.Permission.Code)
                    .ToListAsync();
            });

            if (ofRole != null)
            {
                permissions.UnionWith(ofRole);
            }
        }

        return permissions;
    }
}
