using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.Users.DTOs;
using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using DigiTalent.Shared.Security;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Users.Services;

public class UserService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;

    public UserService(IApplicationDbContext context, ICurrentUserService currentUser, AuditLogService auditLog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
    }

    public async Task<PagedList<UserSummaryResponse>> SearchAsync(PaginationRequest request)
    {
        var query = _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(u => u.Email.Contains(kw) || u.FullName.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserSummaryResponse
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                Status = u.Status.ToString(),
                Roles = u.UserRoles.Select(ur => ur.Role.Code).ToList(),
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
            })
            .ToListAsync();

        return new PagedList<UserSummaryResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<UserDetailResponse> GetByIdAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == user.Email);

        return new UserDetailResponse
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Status = user.Status.ToString(),
            Roles = user.UserRoles.Select(ur => ur.Role.Code).ToList(),
            Permissions = user.UserRoles
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Code).Distinct().ToList(),
            EmployeeId = employee?.Id,
            FailedLoginCount = user.FailedLoginCount,
            EmailVerifiedAt = user.EmailVerifiedAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt,
        };
    }

    public async Task<UserDetailResponse> CreateAsync(CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLowerInvariant()))
            throw new InvalidOperationException("Email already exists.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = PasswordHelper.HashPassword(request.Password),
            FullName = request.FullName,
            AvatarUrl = request.AvatarUrl,
            Status = Domain.Enums.UserStatus.Active,
        };

        if (request.Roles.Count != 0)
        {
            var roles = await _context.Roles
                .Where(r => request.Roles.Contains(r.Code) && r.Status == "ACTIVE")
                .ToListAsync();

            foreach (var role in roles)
            {
                user.UserRoles.Add(new UserRole
                {
                    User = user,
                    RoleId = role.Id,
                    AssignedBy = _currentUser.UserId,
                });
            }
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync(default);

        return await GetByIdAsync(user.Id);
    }

    public async Task<UserDetailResponse> UpdateAsync(Guid userId, UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;

        if (request.Status != null && Enum.TryParse<Domain.Enums.UserStatus>(request.Status, true, out var status))
            user.Status = status;

        await _context.SaveChangesAsync(default);
        return await GetByIdAsync(user.Id);
    }

    public async Task AssignRolesAsync(Guid userId, AssignUserRolesRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        // Prevent SYSTEM_ADMIN assignment by non-admin per RBAC rule (section 7)
        if (request.RoleCodes.Contains(RoleConstants.SystemAdmin) &&
            !_currentUser.Roles.Contains(RoleConstants.SystemAdmin))
        {
            throw new UnauthorizedAccessException("Only SYSTEM_ADMIN can assign the SYSTEM_ADMIN role.");
        }

        // Remove existing roles
        _context.Set<UserRole>().RemoveRange(user.UserRoles);

        // Assign new roles
        var roles = await _context.Roles
            .Where(r => request.RoleCodes.Contains(r.Code) && r.Status == "ACTIVE")
            .ToListAsync();

        foreach (var role in roles)
        {
            _context.Set<UserRole>().Add(new UserRole
            {
                UserId = userId,
                RoleId = role.Id,
                AssignedBy = _currentUser.UserId,
            });
        }

        await _context.SaveChangesAsync(default);

        // Audit: log role assignment change
        await _auditLog.LogAsync(
            action: "ROLE_ASSIGNMENT_CHANGED",
            entityType: "User",
            entityId: userId,
            newValuesJson: string.Join(", ", request.RoleCodes));
    }

    public async Task LockAsync(Guid userId, LockUserRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        user.Status = Domain.Enums.UserStatus.Locked;
        await _context.SaveChangesAsync(default);
    }

    public async Task UnlockAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        user.Status = Domain.Enums.UserStatus.Active;
        user.FailedLoginCount = 0;
        await _context.SaveChangesAsync(default);
    }

    // ── Roles & Permissions ──

    public async Task<List<RoleResponse>> GetRolesAsync()
    {
        return await _context.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Where(r => r.Status == "ACTIVE")
            .Select(r => new RoleResponse
            {
                Id = r.Id,
                Code = r.Code,
                Name = r.Name,
                Description = r.Description,
                ScopeType = r.ScopeType,
                IsSystemRole = r.IsSystemRole,
                Status = r.Status,
                Permissions = r.RolePermissions.Select(rp => rp.Permission.Code).ToList(),
            })
            .ToListAsync();
    }

    public async Task<List<PermissionResponse>> GetPermissionsAsync()
    {
        return await _context.Permissions
            .Select(p => new PermissionResponse
            {
                Id = p.Id,
                Code = p.Code,
                Module = p.Module,
                Action = p.Action,
                Description = p.Description,
            })
            .OrderBy(p => p.Module).ThenBy(p => p.Code)
            .ToListAsync();
    }
}
