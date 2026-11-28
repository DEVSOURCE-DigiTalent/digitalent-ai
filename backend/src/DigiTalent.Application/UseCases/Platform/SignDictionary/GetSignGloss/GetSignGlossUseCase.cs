using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class GetSignGlossUseCase : IUseCase<GetSignGlossUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner? _urls;

    public GetSignGlossUseCase(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(GetSignGlossUseCaseInput input)
    {
        var gloss = await SignGlossRules.FindAsync(_context, input.Id);
        return SignGlossRules.Dto(gloss, await SignGlossRules.VideoAsync(_context, gloss.VideoAssetId), _urls);
    }
}
