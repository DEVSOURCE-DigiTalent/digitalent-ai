using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Platform Admin / Phiên bản khóa học: every catalog version, newest first, with the one in use (the anchor) and
/// the draft being edited.
/// </summary>
public class GetPlatformCatalogVersionsUseCase : IUseCase<GetPlatformCatalogVersionsUseCaseInput, PlatformCatalogVersionsOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformCatalogVersionsUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformCatalogVersionsOutput> ExecuteAsync(GetPlatformCatalogVersionsUseCaseInput input) =>
        PlatformCatalogVersionReader.ReadListAsync(_context);
}
