using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Platform Admin / Khung chuẩn: reads the six-domain standard.
/// </summary>
public class GetPlatformFrameworkUseCase : IUseCase<GetPlatformFrameworkUseCaseInput, PlatformFrameworkOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformFrameworkUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformFrameworkOutput> ExecuteAsync(GetPlatformFrameworkUseCaseInput input) =>
        PlatformFrameworkOutput.ReadAsync(_context);
}
