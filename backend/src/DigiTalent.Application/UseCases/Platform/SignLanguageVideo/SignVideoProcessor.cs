using System.Diagnostics;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// Runs one sign-video render (called by the background worker): checks every sign again, asks the renderer for the
/// video, stores it as a new platform asset and marks the draft READY — or records why it failed (FAILED + code +
/// Vietnamese message). No output file = no success. Every step is logged with the track id to trace a job.
/// </summary>
public sealed partial class SignVideoProcessor
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly IEnumerable<ISignVideoRenderer> _renderers;
    private readonly ILogger<SignVideoProcessor> _logger;
    private readonly TimeProvider _time;
    private readonly ISignAvatarTrackStore? _avatarTracks;

    public SignVideoProcessor(
        IApplicationDbContext context,
        IFileStorageService storage,
        IEnumerable<ISignVideoRenderer> renderers,
        ILogger<SignVideoProcessor> logger,
        TimeProvider time,
        ISignAvatarTrackStore? avatarTracks = null)
    {
        _avatarTracks = avatarTracks;
        _context = context;
        _storage = storage;
        _renderers = renderers;
        _logger = logger;
        _time = time;
    }

    /// <summary>Renders left RENDERING (started again when the server starts).</summary>
    public Task<List<Guid>> PendingAsync(CancellationToken cancellationToken = default) =>
        _context.PlatformSignLanguageTracks.AsNoTracking()
            .Where(t => t.Status == TrackStatus.Rendering)
            .OrderBy(t => t.UpdatedAt)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

    public async Task ProcessAsync(Guid trackId, TimeSpan timeout, CancellationToken stoppingToken = default)
    {
        var track = await _context.PlatformSignLanguageTracks.FirstOrDefaultAsync(t => t.Id == trackId, stoppingToken);
        if (track == null || track.Status != TrackStatus.Rendering) return;

        using var logScope = _logger.BeginScope(new Dictionary<string, object> { ["SignVideoTrackId"] = trackId, ["SignVideoAttempt"] = track.RenderAttempts });
        _logger.LogInformation(
            "Sign video job {TrackId} started: attempt {Attempt}, renderer {Renderer}, mode {Mode}, source asset {AssetId}",
            trackId, track.RenderAttempts, track.Renderer, track.RenderMode, track.SourceAssetId);
        var watch = Stopwatch.StartNew();
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        deadline.CancelAfter(timeout);
        var cancellationToken = deadline.Token;
        PlatformAsset? added = null;

        try
        {
            var renderer = SignVideoStore.Renderer(_renderers, track.Renderer)
                ?? throw new SignRenderException(SignVideo.Errors.RendererNotConfigured, SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured)!);
            var available = await renderer.CheckAsync(cancellationToken);
            if (!available.Available)
            {
                throw new SignRenderException(SignVideo.Errors.RendererNotConfigured, available.Message ?? SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured)!);
            }

            var source = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.SourceAssetId, cancellationToken)
                ?? throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không tìm thấy video gốc.");
            var states = await SignVideoStore.SegmentsAsync(_context, track.Id, cancellationToken);
            var entries = await SignDictionaryLoader.ByIdsAsync(
                _context, states.SelectMany(s => s.Items).Where(i => i.GlossId != null).Select(i => i.GlossId!.Value), cancellationToken);
            var problem = SignVideoRules.RenderProblems(states, entries, track.Renderer).FirstOrDefault();
            if (problem != null) throw new SignRenderException(problem.Code, problem.Message);
            var fingerprint = SignVideoRules.RenderFingerprint(track, states, entries);

            var request = await RequestAsync(track, source, states, entries, cancellationToken) with { Fingerprint = fingerprint };
            _logger.LogInformation("Sign video job {TrackId}: {Sentences} sentence(s), {Signs} sign(s), {Clips} distinct clip(s)",
                trackId, request.Segments.Count, request.Segments.Sum(s => s.Items.Count), request.Clips.Count);

            var report = ProgressReporter(track, stoppingToken);
            await using var output = await renderer.RenderAsync(request, report, cancellationToken);
            if (output.SizeBytes <= 0 || output.DurationMs <= 0 || output.Width <= 0 || output.Height <= 0 || !File.Exists(output.FilePath))
            {
                throw new SignRenderException(SignVideo.Errors.OutputInvalid, SignVideoRules.ErrorMessage(SignVideo.Errors.OutputInvalid)!);
            }

            if (output.SizeBytes > SignVideo.MaxOutputBytes)
            {
                throw new SignRenderException(SignVideo.Errors.OutputInvalid,
                    "Video ký hiệu vượt quá 500 MB. Chọn kiểu “Chỉ tạo track video ký hiệu” hoặc chia video bài học thành nhiều phần.");
            }

            await report(new SignRenderProgress(SignVideo.Stage.Saving, 99, "Lưu video ký hiệu vào kho lưu trữ"));
            string key;
            try
            {
                await using var stream = output.OpenRead();
                key = await _storage.UploadAsync(stream, OutputFileName(source.FileName), output.ContentType, "platform-assets/sign-language", cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                throw new SignRenderException(SignVideo.Errors.StorageUploadFailed, SignVideoRules.ErrorMessage(SignVideo.Errors.StorageUploadFailed)!, ex);
            }

            added = new PlatformAsset
            {
                Kind = PlatformCatalog.AssetKind.Video,
                FileName = OutputFileName(source.FileName),
                ContentType = output.ContentType,
                SizeBytes = output.SizeBytes,
                StorageKey = key,
                UploadedByUserId = track.RequestedByUserId,
            };
            _context.PlatformAssets.Add(added);

            // Measured lengths of the sign videos: later estimates of the map use them.
            var measured = output.VideoDurationsMs;
            if (measured.Count > 0)
            {
                var ids = measured.Keys.ToList();
                foreach (var gloss in await _context.SignGlosses.Where(g => ids.Contains(g.Id)).ToListAsync(cancellationToken))
                {
                    gloss.VideoDurationMs = measured[gloss.Id];
                }
            }

            SignVideoRules.ApplyTimeline(states, output.Placements, measured: true);
            track.OutputAssetId = added.Id;
            track.RenderedFingerprint = fingerprint;
            track.OutputDurationMs = output.DurationMs;
            track.OutputWidth = output.Width;
            track.OutputHeight = output.Height;
            track.RenderedAt = _time.GetUtcNow();
            track.Status = TrackStatus.Ready;
            track.Progress = 100;
            track.ProgressStage = null;
            track.ProgressDetail = null;
            track.ErrorCode = null;
            track.ErrorMessage = null;
            await _context.SaveChangesAsync(stoppingToken);
            // The avatar track served its purpose (a new render renders the avatar again in the browser).
            if (track.Renderer == SignVideo.Renderer.Avatar && _avatarTracks != null) await _avatarTracks.DeleteAsync(trackId, CancellationToken.None);
            _logger.LogInformation(
                "Sign video job {TrackId} done in {Elapsed} ms: output asset {OutputAssetId}, {Bytes} bytes, {Duration} ms, {Width}x{Height}, {Warnings} warning(s)",
                trackId, watch.ElapsedMilliseconds, added.Id, output.SizeBytes, output.DurationMs, output.Width, output.Height, output.Warnings.Count);
            return;
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Server stopping: the render stays RENDERING and runs again at the next start.
            _logger.LogInformation("Sign video job {TrackId} stopped with the server; it resumes at the next start", trackId);
            throw;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Sign video job {TrackId} timed out after {Elapsed} ms (limit {Timeout})", trackId, watch.ElapsedMilliseconds, timeout);
            Fail(track, SignVideo.Errors.JobTimeout, SignVideoRules.ErrorMessage(SignVideo.Errors.JobTimeout)!);
        }
        catch (SignRenderException ex)
        {
            _logger.LogWarning(ex, "Sign video job {TrackId} failed after {Elapsed} ms: {Code}", trackId, watch.ElapsedMilliseconds, ex.Code);
            Fail(track, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sign video job {TrackId} failed unexpectedly after {Elapsed} ms", trackId, watch.ElapsedMilliseconds);
            Fail(track, SignVideo.Errors.RenderFailed,
                $"Dựng video ký hiệu chưa thành công (mã việc {trackId.ToString("N")[..8]}). Bấm Thử lại; nếu vẫn lỗi, báo quản trị hệ thống kèm mã việc.");
        }

        if (added != null) _context.PlatformAssets.Remove(added);
        await _context.SaveChangesAsync(stoppingToken);
    }

    private static void Fail(PlatformSignLanguageTrack track, string code, string message)
    {
        track.Status = TrackStatus.Failed;
        track.ErrorCode = code;
        track.ErrorMessage = message.Length > 500 ? message[..500] : message;
    }

    /// <summary>The render request: the lesson video, the clips of the signs used and the sentences to sign.</summary>
    private async Task<SignRenderRequest> RequestAsync(
        PlatformSignLanguageTrack track,
        PlatformAsset source,
        IReadOnlyList<SignSegmentState> states,
        IReadOnlyDictionary<Guid, SignDictionaryEntry> entries,
        CancellationToken cancellationToken)
    {
        var used = states.SelectMany(s => s.Signed).Select(i => i.GlossId!.Value).Distinct().ToList();
        var clips = new Dictionary<Guid, SignRenderClip>();
        if (track.Renderer == SignVideo.Renderer.Clip)
        {
            var videoIds = used.Select(id => entries[id].VideoAssetId!.Value).Distinct().ToList();
            var videos = await _context.PlatformAssets.AsNoTracking().Where(a => videoIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, cancellationToken);
            foreach (var id in used)
            {
                var entry = entries[id];
                if (!videos.TryGetValue(entry.VideoAssetId!.Value, out var video))
                {
                    throw new SignRenderException(SignVideo.Errors.MediaMissing, $"Video của ký hiệu “{entry.Gloss}” không còn trong hệ thống. Chọn lại video trong Từ điển ký hiệu.");
                }

                clips[id] = new SignRenderClip(id, entry.Gloss, new SignRenderMedia(video.Id, video.StorageKey, video.ContentType), entry.TrimStartMs, entry.TrimEndMs, entry.Mirrored);
            }
        }

        var segments = states.Where(s => !s.Skipped)
            .OrderBy(s => s.Row.SegmentIndex)
            .Select(s => new SignRenderSegment(
                s.Row.SegmentIndex,
                s.Row.StartMs,
                s.Row.EndMs,
                s.Items.Select((item, index) => (item, index))
                    .Where(x => !x.item.Skipped && x.item.GlossId != null)
                    .Select(x => new SignRenderItem(s.Row.SegmentIndex, x.index, x.item.GlossId!.Value, x.item.DurationMs))
                    .ToList()))
            .Where(s => s.Items.Count > 0)
            .ToList();

        return new SignRenderRequest(track.Id, new SignRenderMedia(source.Id, source.StorageKey, source.ContentType), track.RenderMode, clips, segments);
    }

    /// <summary>
    /// Saves where the render is: at once when the step changes, else every 5 points (or a new detail) at most every
    /// 1.5 seconds. Each save is also a heartbeat: a render that moves is not lost.
    /// </summary>
    private Func<SignRenderProgress, Task> ProgressReporter(PlatformSignLanguageTrack track, CancellationToken cancellationToken)
    {
        var lastSaved = Stopwatch.StartNew();
        return async progress =>
        {
            var value = (short)Math.Clamp(progress.Percent, 0, 99);
            var detail = progress.Detail is { Length: > 200 } text ? text[..200] : progress.Detail;
            var newStage = progress.Stage != track.ProgressStage;
            var moved = value - track.Progress >= 5 || detail != track.ProgressDetail;
            if (!newStage && (!moved || lastSaved.Elapsed < TimeSpan.FromSeconds(1.5))) return;
            track.ProgressStage = progress.Stage;
            track.ProgressDetail = detail;
            track.Progress = Math.Max(track.Progress, value);
            await _context.SaveChangesAsync(cancellationToken);
            lastSaved.Restart();
        };
    }

    /// <summary>"bai-giang-1-ngon-ngu-ky-hieu.mp4": only safe characters of the lesson file name are kept.</summary>
    public static string OutputFileName(string sourceFileName)
    {
        var name = SignTextNormalizer.Fold(Path.GetFileNameWithoutExtension(sourceFileName ?? string.Empty)).ToLowerInvariant();
        name = Unsafe().Replace(name, "-").Trim('-');
        if (name.Length > 80) name = name[..80].Trim('-');
        return $"{(name.Length == 0 ? "video" : name)}-ngon-ngu-ky-hieu.mp4";
    }

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex Unsafe();
}
