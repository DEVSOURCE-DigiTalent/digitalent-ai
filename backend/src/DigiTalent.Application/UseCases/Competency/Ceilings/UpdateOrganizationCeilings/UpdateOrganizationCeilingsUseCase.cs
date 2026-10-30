using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Lưu trần doanh nghiệp cho từng lĩnh vực (≤ trần Digital AI). Trần riêng của phòng ban cao hơn trần mới
/// được hạ xuống cho đúng quy tắc trần phòng ban ≤ trần doanh nghiệp.
/// </summary>
public class UpdateOrganizationCeilingsUseCase : IUseCase<UpdateOrganizationCeilingsUseCaseInput, UpdateOrganizationCeilingsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly CapabilityCeilingReader _reader;
    private readonly PulseCatalogReader _catalog;

    public UpdateOrganizationCeilingsUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IAuditService auditService,
        CapabilityCeilingReader reader,
        PulseCatalogReader catalog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _reader = reader;
        _catalog = catalog;
    }

    public async Task<UpdateOrganizationCeilingsUseCaseOutput> ExecuteAsync(UpdateOrganizationCeilingsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        // 1. Phải đủ đúng các lĩnh vực của ma trận
        var domainIds = (await _reader.LoadDomainsAsync(organizationId)).Select(d => d.Id).ToHashSet();
        var requested = input.Ceilings.ToDictionary(c => c.CategoryId, c => (short)c.Level);
        if (requested.Keys.Any(id => !domainIds.Contains(id)))
        {
            throw new BadRequestException("A competency domain is not part of the ceiling matrix.", "ceilings", "CATEGORY_NOT_IN_MATRIX");
        }

        if (domainIds.Any(id => !requested.ContainsKey(id)))
        {
            throw new BadRequestException("Every competency domain needs a ceiling.", "ceilings", "CEILINGS_INCOMPLETE");
        }

        // 2. Ghi trần doanh nghiệp (không vượt quá bản quyền khóa học đã mở, tối thiểu Cấp 1)
        var catalog = await _catalog.LoadAsync(organizationId);
        var seatOrders = await (
            from o in _context.CourseSeatOrders.AsNoTracking()
            join pc in _context.PlatformCourses.AsNoTracking() on o.CourseId equals pc.Id
            where o.OrganizationId == organizationId && o.Seats > 0
            select new { pc.Code, pc.Level }
        ).ToListAsync();

        var maxAllowedByDomain = new Dictionary<Guid, int>();
        foreach (var order in seatOrders)
        {
            var matched = catalog.FirstOrDefault(c => c.Code.Equals(order.Code, StringComparison.OrdinalIgnoreCase));
            if (matched != null)
            {
                var cur = maxAllowedByDomain.GetValueOrDefault(matched.CategoryId, 1);
                maxAllowedByDomain[matched.CategoryId] = Math.Max(cur, order.Level);
            }
        }

        var rows = await _context.CapabilityCeilings
            .Where(c => c.OrganizationId == organizationId && domainIds.Contains(c.CompetencyCategoryId))
            .ToListAsync();
        var orgRows = rows.Where(r => r.DepartmentId == null).ToDictionary(r => r.CompetencyCategoryId);
        var oldValues = orgRows.ToDictionary(r => r.Key.ToString(), r => r.Value.CeilingLevel);
        foreach (var (categoryId, level) in requested)
        {
            var maxAllowed = Math.Max(1, maxAllowedByDomain.GetValueOrDefault(categoryId, 1));
            var effectiveLevel = (short)Math.Min((int)level, maxAllowed);

            if (!orgRows.TryGetValue(categoryId, out var row))
            {
                row = new CapabilityCeiling { OrganizationId = organizationId, CompetencyCategoryId = categoryId };
                _context.CapabilityCeilings.Add(row);
            }

            row.CeilingLevel = effectiveLevel;
            row.UpdatedByUserId = _currentUser.UserId;
        }

        // 3. Hạ trần phòng ban vượt trần mới
        var adjusted = rows
            .Where(r => r.DepartmentId != null && r.CeilingLevel > requested[r.CompetencyCategoryId])
            .ToList();
        foreach (var row in adjusted)
        {
            row.CeilingLevel = requested[row.CompetencyCategoryId];
            row.UpdatedByUserId = _currentUser.UserId;
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "CAPABILITY_CEILING_UPDATED",
            "capability_ceilings",
            organizationId,
            oldValues.Count == 0 ? null : oldValues,
            new
            {
                ceilings = requested.ToDictionary(r => r.Key.ToString(), r => r.Value),
                adjustedDepartments = adjusted.Select(r => r.DepartmentId).Distinct().Count(),
            },
            "Trần doanh nghiệp");

        var output = await _reader.ReadAsync<UpdateOrganizationCeilingsUseCaseOutput>(organizationId);
        output.AdjustedDepartmentCount = adjusted.Select(r => r.DepartmentId).Distinct().Count();
        return output;
    }
}
