using DigiTalent.Application.AuditLogs.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.AuditLogs.Services;

public class AuditLogSearchService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AuditLogSearchService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Search audit logs with filtering and pagination.
    /// SYS_ADMIN sees all logs; HR_MANAGER sees organization-scoped logs.
    /// </summary>
    public async Task<PagedList<AuditLogResponse>> SearchAsync(AuditLogSearchRequest request)
    {
        var query = _context.AuditLogs.AsQueryable();

        // Scope filtering
        if (!_currentUser.Roles.Any(r => r == DigiTalent.Shared.Constants.RoleConstants.SystemAdmin))
        {
            if (_currentUser.Roles.Any(r => r == DigiTalent.Shared.Constants.RoleConstants.HRManager))
            {
                var orgId = await _context.Organizations
                    .Select(o => (Guid?)o.Id)
                    .FirstOrDefaultAsync();
                if (orgId.HasValue)
                    query = query.Where(l => l.OrganizationId == orgId.Value);
            }
            else
            {
                var managedDeptIds = _currentUser.ManagedDepartmentIds;
                if (managedDeptIds.Count != 0)
                {
                    var deptEmployeeIds = await _context.Employees
                        .Where(e => managedDeptIds.Contains(e.DepartmentId))
                        .Select(e => e.Id)
                        .ToListAsync();
                    query = query.Where(l => l.ActorUserId.HasValue
                        && _context.Users.Any(u => u.Id == l.ActorUserId.Value
                            && _context.Employees.Any(emp => emp.UserId == u.Id && deptEmployeeIds.Contains(emp.Id))));
                }
                else
                {
                    query = query.Where(l => l.ActorUserId == _currentUser.UserId);
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(l =>
                l.Action.ToLower().Contains(kw)
                || l.EntityType.ToLower().Contains(kw));
        }

        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(l => l.Action == request.Action);

        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(l => l.EntityType == request.EntityType);

        if (request.FromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= request.FromDate.Value);
        if (request.ToDate.HasValue)
            query = query.Where(l => l.CreatedAt <= request.ToDate.Value);

        if (request.ActorUserId.HasValue)
            query = query.Where(l => l.ActorUserId == request.ActorUserId.Value);

        var totalItems = await query.CountAsync();

        query = (request.SortBy?.ToLower()) switch
        {
            "action" => request.SortDirection == "asc"
                ? query.OrderBy(l => l.Action) : query.OrderByDescending(l => l.Action),
            "entitytype" => request.SortDirection == "asc"
                ? query.OrderBy(l => l.EntityType) : query.OrderByDescending(l => l.EntityType),
            _ => query.OrderByDescending(l => l.CreatedAt),
        };

        var items = await query
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var actorUserIds = items.Where(l => l.ActorUserId.HasValue)
            .Select(l => l.ActorUserId!.Value)
            .Distinct()
            .ToList();
        var actorNames = await _context.Users
            .Where(u => actorUserIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName ?? u.Email);

        return new PagedList<AuditLogResponse>
        {
            Items = items.Select(l => new AuditLogResponse
            {
                Id = l.Id,
                OrganizationId = l.OrganizationId,
                ActorUserId = l.ActorUserId,
                ActorName = l.ActorUserId.HasValue
                    ? actorNames.GetValueOrDefault(l.ActorUserId.Value, "Unknown")
                    : null,
                Action = l.Action,
                EntityType = l.EntityType,
                EntityId = l.EntityId,
                OldValuesJson = l.OldValuesJson,
                NewValuesJson = l.NewValuesJson,
                IpAddress = l.IpAddress,
                CreatedAt = l.CreatedAt,
            }).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }
}
