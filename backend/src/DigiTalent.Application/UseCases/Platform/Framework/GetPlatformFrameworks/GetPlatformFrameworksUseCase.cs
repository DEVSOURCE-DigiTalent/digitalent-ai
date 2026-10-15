using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Platform Admin / Khung chuẩn: every framework with its domains and how many courses it has in the catalog
/// version in use (by level) and in the draft.
/// </summary>
public class GetPlatformFrameworksUseCase : IUseCase<GetPlatformFrameworksUseCaseInput, PlatformFrameworksOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformFrameworksUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformFrameworksOutput> ExecuteAsync(GetPlatformFrameworksUseCaseInput input) =>
        PlatformFrameworkReader.ReadListAsync(_context);
}
