using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Captions of a video for the course builder: the draft, what learners see and the state of the AI job.</summary>
public class GetPlatformAssetCaptionsUseCase : IUseCase<GetPlatformAssetCaptionsUseCaseInput, PlatformAssetCaptionsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICaptionTranscriber _transcriber;

    public GetPlatformAssetCaptionsUseCase(IApplicationDbContext context, ICaptionTranscriber transcriber)
    {
        _context = context;
        _transcriber = transcriber;
    }

    public async Task<PlatformAssetCaptionsDto> ExecuteAsync(GetPlatformAssetCaptionsUseCaseInput input)
    {
        var asset = await PlatformCaptionStore.VideoAsync(_context, input.AssetId);
        var caption = await _context.PlatformAssetCaptions.AsNoTracking()
            .FirstOrDefaultAsync(c => c.AssetId == asset.Id && c.Language == PlatformCatalog.Captions.Vietnamese);
        return PlatformCaptionRules.Dto(asset.Id, caption, _transcriber.IsConfigured);
    }
}
