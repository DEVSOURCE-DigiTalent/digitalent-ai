using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Services;

/// <summary>
/// Service for creating business audit log entries.
/// Sensitive operations must call LogAsync to record who did what, when, and optionally the before/after state.
/// </summary>
public class AuditLogService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Creates an audit log entry for a sensitive business operation.
    /// </summary>
    public async Task LogAsync(
        string action,
        string entityType,
        Guid? entityId = null,
        string? oldValuesJson = null,
        string? newValuesJson = null,
        string? ipAddress = null)
    {
        var orgId = await _context.Organizations
            .Select(o => (Guid?)o.Id)
            .FirstOrDefaultAsync();

        var log = new AuditLog
        {
            OrganizationId = orgId,
            ActorUserId = _currentUser.UserId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValuesJson = oldValuesJson,
            NewValuesJson = newValuesJson,
            IpAddress = ipAddress,
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Creates an audit log entry with the specified actor (for system-triggered actions).
    /// </summary>
    public async Task LogSystemAsync(
        Guid? actorUserId,
        string action,
        string entityType,
        Guid? entityId = null,
        string? oldValuesJson = null,
        string? newValuesJson = null)
    {
        var orgId = await _context.Organizations
            .Select(o => (Guid?)o.Id)
            .FirstOrDefaultAsync();

        var log = new AuditLog
        {
            OrganizationId = orgId,
            ActorUserId = actorUserId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValuesJson = oldValuesJson,
            NewValuesJson = newValuesJson,
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(default);
    }
}
