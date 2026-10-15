using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class GetPlatformOrganizationDetailUseCase : IUseCase<GetPlatformOrganizationDetailUseCaseInput, PlatformOrganizationDetailOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformOrganizationDetailUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformOrganizationDetailOutput> ExecuteAsync(GetPlatformOrganizationDetailUseCaseInput input) =>
        PlatformOrganizationReader.ReadDetailAsync(_context, input.Id);
}
