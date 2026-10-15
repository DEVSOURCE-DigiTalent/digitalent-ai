using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;

namespace DigiTalent.Application.UseCases.Platform.Courses;

/// <summary>
/// Platform Admin / Chương trình học: the 18 standard courses with versions, prices and seat totals.
/// </summary>
public class GetPlatformCoursesUseCase : IUseCase<GetPlatformCoursesUseCaseInput, GetPlatformCoursesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformCoursesUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformCoursesUseCaseOutput> ExecuteAsync(GetPlatformCoursesUseCaseInput input) =>
        new() { Items = await PlatformCatalogReader.ReadCoursesAsync(_context) };
}
