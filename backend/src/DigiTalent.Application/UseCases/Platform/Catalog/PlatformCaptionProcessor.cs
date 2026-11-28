using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Runs one AI caption job (called by the background worker, one video at a time): reads the video from storage,
/// asks <see cref="ICaptionTranscriber"/> for the captions and stores them as the draft (READY), or records why it
/// failed (FAILED, the previous draft is kept). Learners keep seeing the published captions either way.
/// </summary>
public sealed class PlatformCaptionProcessor
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly ICaptionTranscriber _transcriber;
    private readonly ILogger<PlatformCaptionProcessor> _logger;

    public PlatformCaptionProcessor(
        IApplicationDbContext context,
        IFileStorageService storage,
        ICaptionTranscriber transcriber,
        ILogger<PlatformCaptionProcessor> logger)
    {
        _context = context;
        _storage = storage;
        _transcriber = transcriber;
        _logger = logger;
    }

    /// <summary>Ids of the jobs left PROCESSING (started again when the server starts).</summary>
    public Task<List<Guid>> PendingAsync(CancellationToken cancellationToken = default) =>
        _context.PlatformAssetCaptions.AsNoTracking()
            .Where(c => c.Status == CaptionStatus.Processing)
            .OrderBy(c => c.UpdatedAt)
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

    public async Task ProcessAsync(Guid captionId, CancellationToken cancellationToken = default)
    {
        var caption = await _context.PlatformAssetCaptions.FirstOrDefaultAsync(c => c.Id == captionId, cancellationToken);
        if (caption == null || caption.Status != CaptionStatus.Processing) return;

        var asset = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == caption.AssetId, cancellationToken);
        try
        {
            if (asset == null || !_transcriber.IsConfigured)
            {
                throw new CaptionTranscriptionException(asset == null ? "VIDEO_FILE_MISSING" : "AI_NOT_CONFIGURED", "Caption job cannot run.");
            }

            Stream content;
            try
            {
                content = await _storage.DownloadAsync(asset.StorageKey, cancellationToken);
            }
            catch (Exception ex) when (ex is NotFoundException or FileNotFoundException or DirectoryNotFoundException)
            {
                throw new CaptionTranscriptionException("VIDEO_FILE_MISSING", "The video file is not in storage.", ex);
            }

            CaptionTranscript transcript;
            await using (content)
            {
                transcript = await _transcriber.TranscribeAsync(
                    new CaptionMediaFile(content, asset.SizeBytes, asset.ContentType, asset.FileName), cancellationToken);
            }

            caption.DraftCues = PlatformCaptionRules.Serialize(PlatformCaptionRules.Normalize(transcript.Cues));
            caption.Source = PlatformCatalog.Captions.SourceAi;
            caption.Model = transcript.Model;
            caption.Status = CaptionStatus.Ready;
            caption.ErrorCode = null;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Server stopping: the job stays PROCESSING and runs again at the next start.
            throw;
        }
        catch (CaptionTranscriptionException ex)
        {
            _logger.LogWarning(ex, "Caption job {CaptionId} failed: {Code}", captionId, ex.Code);
            caption.Status = CaptionStatus.Failed;
            caption.ErrorCode = ex.Code;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Caption job {CaptionId} failed unexpectedly", captionId);
            caption.Status = CaptionStatus.Failed;
            caption.ErrorCode = "AI_FAILED";
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
