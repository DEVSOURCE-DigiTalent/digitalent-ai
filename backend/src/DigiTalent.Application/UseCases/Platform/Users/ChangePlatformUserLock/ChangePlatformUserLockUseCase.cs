using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

/// <summary>
/// Locks (no end date, so sign-in stays blocked) or unlocks an account. Platform Admin accounts and the
/// caller's own account cannot be locked here.
/// </summary>
public class ChangePlatformUserLockUseCase : IUseCase<ChangePlatformUserLockUseCaseInput, PlatformUserDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public ChangePlatformUserLockUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<PlatformUserDetailOutput> ExecuteAsync(ChangePlatformUserLockUseCaseInput input)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == input.UserId)
            ?? throw new NotFoundException($"User '{input.UserId}' not found.");
        if (input.Lock)
        {
            if (user.Id == _currentUser.UserId)
                throw new BadRequestException("You cannot lock your own account.", "userId", "CANNOT_LOCK_SELF");
            var isPlatformAdmin = await (
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                where userRole.UserId == user.Id && role.Code == Roles.PlatformAdmin
                select userRole).AnyAsync();
            if (isPlatformAdmin)
                throw new BadRequestException("Platform Admin accounts cannot be locked here.", "userId", "CANNOT_LOCK_PLATFORM_ADMIN");
            if (user.Status == Statuses.User.Locked && user.LockedUntil == null)
                throw new ConflictException("The account is already locked.");
            if (user.Status == Statuses.User.Inactive)
                throw new BadRequestException("The account is deactivated.", "userId", "USER_INACTIVE");
        }
        else if (user.Status != Statuses.User.Locked)
        {
            throw new ConflictException("The account is not locked.");
        }

        var oldValues = new { user.Status, user.LockedUntil };
        user.Status = input.Lock ? Statuses.User.Locked : Statuses.User.Active;
        user.LockedUntil = null;
        user.FailedLoginCount = 0;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            input.Lock ? "PLATFORM_USER_LOCKED" : "PLATFORM_USER_UNLOCKED",
            "users",
            user.Id,
            oldValues,
            new { user.Status, reason = input.Reason.Trim() },
            user.Email);

        return await GetPlatformUserDetailUseCase.ReadAsync(_context, user.Id);
    }
}
