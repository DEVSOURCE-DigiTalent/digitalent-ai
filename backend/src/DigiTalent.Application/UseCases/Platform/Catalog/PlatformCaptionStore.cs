using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Loads the video and its Vietnamese captions for the caption use cases.</summary>
public static class PlatformCaptionStore
{
    /// <summary>The uploaded video; 404 when unknown, 400 NOT_A_VIDEO for an image or a PDF.</summary>
    public static async Task<PlatformAsset> VideoAsync(IApplicationDbContext context, Guid assetId)
    {
        var asset = await context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == assetId)
            ?? throw new NotFoundException("Không tìm thấy video.");
        if (asset.Kind != PlatformCatalog.AssetKind.Video)
        {
            throw new BadRequestException("Chỉ video mới có lời thoại.", "assetId", "NOT_A_VIDEO");
        }

        return asset;
    }

    /// <summary>The tracked caption row of the video, or null.</summary>
    public static Task<PlatformAssetCaption?> FindAsync(IApplicationDbContext context, Guid assetId) =>
        context.PlatformAssetCaptions.FirstOrDefaultAsync(c => c.AssetId == assetId && c.Language == PlatformCatalog.Captions.Vietnamese);

    /// <summary>409 while the AI is working on the draft (unless the job was lost).</summary>
    public static void EnsureNotProcessing(PlatformAssetCaption? caption, DateTimeOffset now)
    {
        if (caption?.Status == Statuses.PlatformAssetCaption.Processing && !PlatformCaptionRules.IsStale(caption, now))
        {
            throw new ConflictException("AI đang tạo lời thoại cho video này. Chờ xong rồi sửa.");
        }
    }
}
