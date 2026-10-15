using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Creates the draft version as a copy of the version in use. Courses are added and edited only in the draft;
/// there is at most one draft (409 when it already exists).
/// </summary>
public class CreatePlatformCatalogDraftUseCase : IUseCase<CreatePlatformCatalogDraftUseCaseInput, PlatformCatalogVersionDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly IAuditService _auditService;

    public CreatePlatformCatalogDraftUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogVersionDetail> ExecuteAsync(CreatePlatformCatalogDraftUseCaseInput input)
    {
        var draft = await _editor.CreateDraftAsync();
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_CATALOG_DRAFT_CREATED",
            "platform_catalog_versions",
            draft.Id,
            newValues: new { versionNo = draft.VersionNo },
            entityLabel: $"Chương trình học v{draft.VersionNo}");

        return await PlatformCatalogVersionReader.ReadDetailAsync(_context, draft.VersionNo);
    }
}
