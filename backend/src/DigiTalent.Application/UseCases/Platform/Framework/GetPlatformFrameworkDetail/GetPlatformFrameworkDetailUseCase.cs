using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Platform Admin / Khung chuẩn / chi tiết: domains (published and draft descriptions), the courses of each domain
/// in the version in use and those added in the draft, and the release history.
/// </summary>
public class GetPlatformFrameworkDetailUseCase : IUseCase<GetPlatformFrameworkDetailUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformFrameworkDetailUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformFrameworkDetail> ExecuteAsync(GetPlatformFrameworkDetailUseCaseInput input) =>
        PlatformFrameworkReader.ReadDetailAsync(_context, input.FrameworkId);
}
