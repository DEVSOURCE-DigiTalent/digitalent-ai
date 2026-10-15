using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>
/// Platform Admin / Tổ chức: every organization, filterable by status (ACTIVE / SUSPENDED) and stage (TRIAL / PAID).
/// </summary>
public class GetPlatformOrganizationsUseCase : IUseCase<GetPlatformOrganizationsUseCaseInput, GetPlatformOrganizationsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformOrganizationsUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformOrganizationsUseCaseOutput> ExecuteAsync(GetPlatformOrganizationsUseCaseInput input)
    {
        IEnumerable<PlatformOrganizationItem> items = await PlatformOrganizationReader.ReadAllAsync(_context);
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim();
            items = items.Where(o =>
                o.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                || o.Code.Contains(search, StringComparison.OrdinalIgnoreCase)
                || (o.OwnerEmail?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false));
        }
        if (!string.IsNullOrWhiteSpace(input.Status)) items = items.Where(o => o.Status == input.Status.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(input.Stage)) items = items.Where(o => o.Stage == input.Stage.Trim().ToUpperInvariant());

        var filtered = items.OrderByDescending(o => o.CreatedAt).ToList();
        return new GetPlatformOrganizationsUseCaseOutput
        {
            Items = filtered.Skip((input.PageIndex - 1) * input.PageSize).Take(input.PageSize).ToList(),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = filtered.Count,
        };
    }
}
