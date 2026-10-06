using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Settings;

public class GetOrganizationUseCase : IUseCase<GetOrganizationInput, OrganizationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetOrganizationUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<OrganizationDto> ExecuteAsync(GetOrganizationInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var org = await _context.Organizations.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orgId)
            ?? throw new NotFoundException("Organization not found.");

        var settings = await _context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == orgId)
            .ToDictionaryAsync(s => s.Key, s => (object?)s.Value);

        return new OrganizationDto
        {
            Id = org.Id,
            Code = org.Code,
            Name = org.Name,
            Domain = org.Domain,
            Status = org.Status,
            Settings = settings,
        };
    }
}

public class UpdateOrgSettingsUseCase : IUseCase<UpdateOrgSettingsInput, UpdateOrgSettingsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateOrgSettingsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateOrgSettingsOutput> ExecuteAsync(UpdateOrgSettingsInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId;

        foreach (var (key, value) in input.Settings)
        {
            var existing = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.OrganizationId == orgId && s.Key == key);

            if (existing != null)
            {
                existing.Value = value;
                existing.UpdatedByUserId = userId;
            }
            else
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    OrganizationId = orgId,
                    Key = key,
                    Value = value,
                    UpdatedByUserId = userId,
                });
            }
        }

        await _context.SaveChangesAsync();
        return new UpdateOrgSettingsOutput { Success = true };
    }
}

public class GetAuditLogUseCase : IUseCase<GetAuditLogInput, GetAuditLogOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAuditLogUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetAuditLogOutput> ExecuteAsync(GetAuditLogInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var query = _context.AuditLogs.AsNoTracking()
            .Where(a => a.OrganizationId == orgId);

        if (!string.IsNullOrWhiteSpace(input.EntityType))
            query = query.Where(a => a.EntityType == input.EntityType.Trim());

        if (!string.IsNullOrWhiteSpace(input.Action))
            query = query.Where(a => a.Action == input.Action.Trim());

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(a =>
                a.EntityType.ToLower().Contains(search) ||
                a.Action.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var users = _context.Users.AsNoTracking();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                ActorUserId = a.ActorUserId,
                ActorName = a.ActorUserId.HasValue
                    ? users.Where(u => u.Id == a.ActorUserId.Value).Select(u => u.DisplayName).FirstOrDefault()
                    : null,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return new GetAuditLogOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
