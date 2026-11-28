using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>The sign-language video of a lesson video: NONE with the prerequisites, or the draft, its map and its outputs.</summary>
public class GetSignLanguageVideoUseCase : IUseCase<GetSignLanguageVideoUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly SignLanguageVideoReader _reader;

    public GetSignLanguageVideoUseCase(IApplicationDbContext context, SignLanguageVideoReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(GetSignLanguageVideoUseCaseInput input)
    {
        var asset = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == input.AssetId)
            ?? throw new NotFoundException("Không tìm thấy video.");
        if (asset.Kind != PlatformCatalog.AssetKind.Video)
        {
            throw new BadRequestException("Chỉ video mới có video ngôn ngữ ký hiệu.", "assetId", "NOT_A_VIDEO");
        }

        return await _reader.ReadAsync(asset.Id, string.IsNullOrWhiteSpace(input.SignLanguage) ? SignLanguage.Code.Vsl : input.SignLanguage);
    }
}
