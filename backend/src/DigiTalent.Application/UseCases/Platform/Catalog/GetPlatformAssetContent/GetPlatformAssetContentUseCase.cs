using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// The file of an uploaded asset, reached through a signed link (an &lt;img&gt; or &lt;video&gt; cannot send the
/// bearer token). An expired or wrong signature reads as not found.
/// </summary>
public class GetPlatformAssetContentUseCase : IUseCase<GetPlatformAssetContentUseCaseInput, GetPlatformAssetContentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly IPlatformAssetUrlSigner _signer;

    public GetPlatformAssetContentUseCase(IApplicationDbContext context, IFileStorageService storage, IPlatformAssetUrlSigner signer)
    {
        _context = context;
        _storage = storage;
        _signer = signer;
    }

    public async Task<GetPlatformAssetContentUseCaseOutput> ExecuteAsync(GetPlatformAssetContentUseCaseInput input)
    {
        if (!_signer.IsValid(input.AssetId, input.ExpiresAt, input.Signature))
        {
            throw new NotFoundException("Không tìm thấy tệp.");
        }

        var asset = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == input.AssetId)
                    ?? throw new NotFoundException("Không tìm thấy tệp.");
        Stream content;
        try
        {
            content = await _storage.DownloadAsync(asset.StorageKey);
        }
        catch (FileNotFoundException)
        {
            throw new NotFoundException("Không tìm thấy tệp.");
        }

        return new GetPlatformAssetContentUseCaseOutput { Content = content, ContentType = asset.ContentType, FileName = asset.FileName };
    }
}
