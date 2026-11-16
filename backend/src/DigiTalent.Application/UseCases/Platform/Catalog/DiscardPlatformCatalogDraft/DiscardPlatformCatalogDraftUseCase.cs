using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class DiscardPlatformCatalogDraftUseCaseInput
{
    public int VersionNo { get; set; }
}

/// <summary>
/// Discards the open draft catalog version, reverting the catalog to the published version in use.
/// </summary>
public class DiscardPlatformCatalogDraftUseCase : IUseCase<DiscardPlatformCatalogDraftUseCaseInput, PlatformCatalogVersionsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly IAuditService _auditService;

    public DiscardPlatformCatalogDraftUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogVersionsOutput> ExecuteAsync(DiscardPlatformCatalogDraftUseCaseInput input)
    {
        await _editor.DiscardDraftAsync(input.VersionNo);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_CATALOG_DRAFT_DISCARDED",
            "platform_catalog_versions",
            Guid.Empty,
            newValues: new { versionNo = input.VersionNo },
            entityLabel: $"Hủy bản nháp v{input.VersionNo}");

        return await PlatformCatalogVersionReader.ReadListAsync(_context);
    }
}
