using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Đơn giá: sets the per-seat price and sales status of several courses in the draft catalog version at once. The
/// version in use keeps its prices until the draft is published. Basic courses stay free.
/// </summary>
public class UpdatePlatformCatalogPricesUseCase : IUseCase<UpdatePlatformCatalogPricesUseCaseInput, PlatformCatalogVersionDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly IAuditService _auditService;

    public UpdatePlatformCatalogPricesUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogVersionDetail> ExecuteAsync(UpdatePlatformCatalogPricesUseCaseInput input)
    {
        var draft = await _editor.DraftAsync(input.VersionNo);
        var courseIds = input.Items.Select(i => i.CourseId).ToList();
        var courses = await _context.PlatformCatalogCourses
            .Where(c => c.VersionId == draft.Id && courseIds.Contains(c.CourseId))
            .ToListAsync();
        var identities = await _context.PlatformCourses.Where(c => courseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);

        var changes = new List<object>();
        foreach (var item in input.Items)
        {
            var course = courses.FirstOrDefault(c => c.CourseId == item.CourseId)
                ?? throw new NotFoundException("Khóa học không có trong phiên bản này.");
            var price = course.Level == PlatformCatalog.MinLevel ? 0 : item.PricePerSeat;
            if (course.PricePerSeat == price && course.SalesStatus == item.SalesStatus) continue;

            var identity = identities[course.CourseId];
            changes.Add(new { code = identity.Code, from = course.PricePerSeat, to = price, salesFrom = course.SalesStatus, salesTo = item.SalesStatus });
            course.PricePerSeat = price;
            course.SalesStatus = item.SalesStatus;
            if (identity.PublishedAt == null)
            {
                // An unpublished course has no version in use: keep its identity in step with the draft.
                identity.PricePerSeat = price;
            }

            PlatformCatalogEditor.MarkEdited(course);
        }

        if (changes.Count > 0)
        {
            await _context.SaveChangesAsync();
            await _auditService.LogAsync(
                "PLATFORM_CATALOG_PRICES_UPDATED",
                "platform_catalog_versions",
                draft.Id,
                newValues: new { versionNo = draft.VersionNo, changes },
                entityLabel: $"v{draft.VersionNo} · {changes.Count} khóa");
        }

        return await PlatformCatalogVersionReader.ReadDetailAsync(_context, input.VersionNo);
    }
}
