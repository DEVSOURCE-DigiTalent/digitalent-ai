using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public static class PlatformAuditReader
{
    public static IQueryable<PlatformAuditLogItem> Query(IApplicationDbContext context) =>
        from log in context.AuditLogs.AsNoTracking()
        join actor in context.Users on log.ActorUserId equals actor.Id into actors
        from actor in actors.DefaultIfEmpty()
        join organization in context.Organizations on log.OrganizationId equals organization.Id into organizations
        from organization in organizations.DefaultIfEmpty()
        orderby log.CreatedAt descending
        select new PlatformAuditLogItem
        {
            Id = log.Id,
            Action = log.Action,
            EntityType = log.EntityType,
            EntityId = log.EntityId,
            EntityLabel = log.EntityLabel,
            OrganizationId = log.OrganizationId,
            OrganizationName = organization == null ? null : organization.Name,
            ActorEmail = actor == null ? null : actor.Email,
            OldValues = log.OldValues,
            NewValues = log.NewValues,
            CreatedAt = log.CreatedAt,
        };
}
