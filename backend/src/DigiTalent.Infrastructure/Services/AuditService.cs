using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        ILogger<AuditService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task LogAsync(
        string action,
        string entityType,
        Guid? entityId = null,
        object? oldValues = null,
        object? newValues = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var auditLog = new AuditLog
            {
                OrganizationId = _currentUser.OrganizationId,
                ActorUserId = _currentUser.UserId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                IpHash = _currentUser.IpAddress,
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            // Không để lỗi ghi log làm sập nghiệp vụ chính, nhưng ghi warning
            _logger.LogWarning(ex, "Failed to persist audit log for Action: {Action}, Entity: {EntityType}", action, entityType);
        }
    }
}
