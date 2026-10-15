using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>The courses of one catalog version, by framework, domain and level, with what changed in a draft.</summary>
public class GetPlatformCatalogVersionUseCase : IUseCase<GetPlatformCatalogVersionUseCaseInput, PlatformCatalogVersionDetail>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformCatalogVersionUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformCatalogVersionDetail> ExecuteAsync(GetPlatformCatalogVersionUseCaseInput input) =>
        PlatformCatalogVersionReader.ReadDetailAsync(_context, input.VersionNo);
}
