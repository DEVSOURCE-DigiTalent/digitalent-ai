using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>"Xem trước": the last rendered video of the draft (signed link, like every platform asset). 404 before a render.</summary>
public class GetSignLanguageVideoPreviewUseCase : IUseCase<GetSignLanguageVideoPreviewUseCaseInput, SignVideoOutputDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner? _urls;

    public GetSignLanguageVideoPreviewUseCase(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<SignVideoOutputDto> ExecuteAsync(GetSignLanguageVideoPreviewUseCaseInput input)
    {
        var track = await _context.PlatformSignLanguageTracks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == input.TrackId)
            ?? throw new NotFoundException("Không tìm thấy video ngôn ngữ ký hiệu.");
        var asset = track.OutputAssetId == null
            ? null
            : await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.OutputAssetId);
        return SignVideoRules.Output(asset, track.RenderMode, track.RenderedAt, track.OutputDurationMs, track.OutputWidth, track.OutputHeight, _urls)
            ?? throw new NotFoundException("Chưa có video ký hiệu để xem trước. Bấm “Tạo video ký hiệu” trước.");
    }
}
