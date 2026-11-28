using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>Loading and guards shared by the sign-language video use cases.</summary>
public static class SignVideoStore
{
    /// <summary>The video is shown by a lesson (a VIDEO block or a slide), not a dictionary clip or a rendered output.</summary>
    public static async Task<bool> IsLessonVideoAsync(IApplicationDbContext context, Guid assetId, CancellationToken cancellationToken = default) =>
        await context.PlatformModuleBlocks.AsNoTracking().AnyAsync(b => b.AssetId == assetId && b.BlockType == PlatformCatalog.BlockType.Video, cancellationToken)
        || await context.PlatformSlideItems.AsNoTracking().AnyAsync(i => i.AssetId == assetId, cancellationToken);

    /// <summary>The lesson video: 404 when unknown, 400 NOT_A_VIDEO / SIGN_NOT_A_LESSON_VIDEO otherwise.</summary>
    public static async Task<PlatformAsset> LessonVideoAsync(IApplicationDbContext context, Guid assetId, CancellationToken cancellationToken = default)
    {
        var asset = await context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == assetId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy video.");
        if (asset.Kind != PlatformCatalog.AssetKind.Video)
        {
            throw new BadRequestException("Chỉ video mới có video ngôn ngữ ký hiệu.", "assetId", "NOT_A_VIDEO");
        }

        if (!await IsLessonVideoAsync(context, assetId, cancellationToken))
        {
            throw new BadRequestException("Chỉ tạo video ngôn ngữ ký hiệu cho video của bài học (khối Video hoặc Slide).", "assetId", SignVideo.Errors.NotALessonVideo);
        }

        return asset;
    }

    public static Task<PlatformSignLanguageTrack?> FindByAssetAsync(IApplicationDbContext context, Guid assetId, string signLanguage, CancellationToken cancellationToken = default) =>
        context.PlatformSignLanguageTracks.FirstOrDefaultAsync(t => t.SourceAssetId == assetId && t.SignLanguage == signLanguage, cancellationToken);

    public static async Task<PlatformSignLanguageTrack> TrackAsync(IApplicationDbContext context, Guid trackId, CancellationToken cancellationToken = default) =>
        await context.PlatformSignLanguageTracks.FirstOrDefaultAsync(t => t.Id == trackId, cancellationToken)
        ?? throw new NotFoundException("Không tìm thấy video ngôn ngữ ký hiệu.");

    /// <summary>The tracked sentences of a track with their signs, in order.</summary>
    public static async Task<List<SignSegmentState>> SegmentsAsync(IApplicationDbContext context, Guid trackId, CancellationToken cancellationToken = default) =>
        (await context.PlatformSignLanguageSegments.Where(s => s.TrackId == trackId).OrderBy(s => s.SegmentIndex).ToListAsync(cancellationToken))
        .Select(SignVideoRules.State)
        .ToList();

    /// <summary>409 SIGN_JOB_ALREADY_RUNNING while a render is running (unless it was lost).</summary>
    public static void EnsureNotRendering(PlatformSignLanguageTrack track, DateTimeOffset now)
    {
        if (track.Status == TrackStatus.Rendering && !SignVideoRules.IsStale(track, now))
        {
            throw new ConflictException(SignVideoRules.ErrorMessage(SignVideo.Errors.JobAlreadyRunning)!, "trackId", SignVideo.Errors.JobAlreadyRunning);
        }
    }

    /// <summary>
    /// The cues to analyse. 400 SIGN_CAPTION_NOT_FOUND without captions, SIGN_CAPTION_NOT_PUBLISHED when the published
    /// copy is asked for but missing; 409 while the AI is writing the draft.
    /// </summary>
    public static async Task<List<CaptionCueDto>> CaptionCuesAsync(IApplicationDbContext context, Guid assetId, string source, DateTimeOffset now, CancellationToken cancellationToken = default)
    {
        var caption = await context.PlatformAssetCaptions.AsNoTracking()
            .FirstOrDefaultAsync(c => c.AssetId == assetId && c.Language == PlatformCatalog.Captions.Vietnamese, cancellationToken);
        var draft = PlatformCaptionRules.Parse(caption?.DraftCues);
        var published = caption?.PublishedCues == null ? new List<CaptionCueDto>() : PlatformCaptionRules.Parse(caption.PublishedCues);
        if (caption == null || (draft.Count == 0 && published.Count == 0))
        {
            throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.CaptionNotFound)!, "captionSource", SignVideo.Errors.CaptionNotFound);
        }

        if (source == SignVideo.CaptionSource.Published)
        {
            if (published.Count == 0)
            {
                throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.CaptionNotPublished)!, "captionSource", SignVideo.Errors.CaptionNotPublished);
            }

            return published;
        }

        if (caption.Status == CaptionStatus.Processing && !PlatformCaptionRules.IsStale(caption, now))
        {
            throw new ConflictException("AI đang viết lại lời thoại. Chờ xong rồi tạo video ký hiệu.", "captionSource", SignVideo.Errors.CaptionNotFound);
        }

        if (draft.Count == 0)
        {
            throw new BadRequestException("Lời thoại chưa có câu nào. Tạo hoặc nhập lời thoại ở bước 1.", "captionSource", SignVideo.Errors.CaptionNotFound);
        }

        return draft;
    }

    /// <summary>Fingerprint of the captions the track would read now (null when there are none).</summary>
    public static async Task<string?> CurrentCaptionFingerprintAsync(IApplicationDbContext context, Guid assetId, string source, CancellationToken cancellationToken = default)
    {
        var caption = await context.PlatformAssetCaptions.AsNoTracking()
            .Where(c => c.AssetId == assetId && c.Language == PlatformCatalog.Captions.Vietnamese)
            .Select(c => new { c.DraftCues, c.PublishedCues })
            .FirstOrDefaultAsync(cancellationToken);
        if (caption == null) return null;
        var json = source == SignVideo.CaptionSource.Published ? caption.PublishedCues : caption.DraftCues;
        return json == null ? null : SignVideoRules.CaptionFingerprint(PlatformCaptionRules.Parse(json));
    }

    public static ISignVideoRenderer? Renderer(IEnumerable<ISignVideoRenderer> renderers, string kind) =>
        renderers.FirstOrDefault(r => r.Kind == kind);

    /// <summary>400 SIGN_RENDERER_NOT_CONFIGURED when the renderer of the track cannot run here.</summary>
    public static async Task EnsureRendererAsync(IEnumerable<ISignVideoRenderer> renderers, string kind, CancellationToken cancellationToken = default)
    {
        var renderer = Renderer(renderers, kind);
        var status = renderer == null ? new SignRendererStatus(false, null) : await renderer.CheckAsync(cancellationToken);
        if (!status.Available)
        {
            throw new BadRequestException(
                status.Message ?? SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured)!, "renderer", SignVideo.Errors.RendererNotConfigured);
        }
    }

    /// <summary>The file exists in storage and is not empty (object metadata when available, else opening it).</summary>
    public static async Task<bool> IsStoredAsync(IFileStorageService storage, IDirectFileStorageService? direct, string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (direct is { SupportsDirectAccess: true })
            {
                var metadata = await direct.GetMetadataAsync(key, cancellationToken);
                return metadata is { SizeBytes: > 0 };
            }

            await using var stream = await storage.DownloadAsync(key, cancellationToken);
            return !stream.CanSeek || stream.Length > 0;
        }
        catch (Exception ex) when (ex is NotFoundException or FileNotFoundException or DirectoryNotFoundException or IOException)
        {
            return false;
        }
    }
}
