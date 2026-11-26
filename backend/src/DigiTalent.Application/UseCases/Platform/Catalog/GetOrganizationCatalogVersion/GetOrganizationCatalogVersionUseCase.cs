using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// The catalog version an organization learns from, the published versions it can be moved to, and the courses a move
/// to <see cref="GetOrganizationCatalogVersionUseCaseInput.VersionNo"/> (default: the newest version) would change.
/// </summary>
public class GetOrganizationCatalogVersionUseCase : IUseCase<GetOrganizationCatalogVersionUseCaseInput, OrganizationCatalogVersionOutput>
{
    private readonly IApplicationDbContext _context;

    public GetOrganizationCatalogVersionUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public Task<OrganizationCatalogVersionOutput> ExecuteAsync(GetOrganizationCatalogVersionUseCaseInput input) =>
        OrganizationCatalogVersionReader.ReadAsync(_context, input.OrganizationId, input.VersionNo);
}
