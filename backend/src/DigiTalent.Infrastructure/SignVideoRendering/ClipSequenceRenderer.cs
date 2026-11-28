using System.Globalization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>
/// MVP renderer (CLIP): joins the dictionary videos of real people signing, on the caption timeline, with FFmpeg.
/// 1. downloads the lesson video and each sign video into a folder of its own for the job (names are generated, never
///    taken from users); 2. normalizes each sign clip once (cut to the part chosen in the dictionary, mirrored ones
///    flipped, sound removed, fixed size and frame rate); 3. places the signs with <see cref="SignTimelinePlanner"/> on
///    a frame grid (no drift); 4. renders each placement (faster up to the limit, end cut, last frame held) and the
///    rests between sentences (plain background); 5. joins them and composes the output: the lesson video with the
///    signer window at the bottom left (OVERLAY, SignComposer), the signer full frame with the lesson sound (FULLSCREEN) or the
///    signer track alone (TRACK_ONLY) — H.264 + AAC MP4 with faststart, playable in every browser; 6. checks the file.
/// The lesson sound is kept as is (re-encoded to AAC); sign clips never bring sound. Temporary files are deleted.
/// </summary>
public sealed class ClipSequenceRenderer : ISignVideoRenderer
{
    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromMinutes(2);

    private readonly SignVideoSettings _settings;
    private readonly IFileStorageService _storage;
    private readonly ILogger<ClipSequenceRenderer> _logger;
    private readonly FfmpegToolCheck _tools;

    public ClipSequenceRenderer(SignVideoSettings settings, IFileStorageService storage, ILogger<ClipSequenceRenderer> logger, FfmpegToolCheck? tools = null)
    {
        _settings = settings.Sanitized();
        _storage = storage;
        _logger = logger;
        _tools = tools ?? new FfmpegToolCheck(settings, Microsoft.Extensions.Logging.Abstractions.NullLogger<FfmpegToolCheck>.Instance);
    }

    public string Kind => SignVideo.Renderer.Clip;

    public Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default) => _tools.CheckAsync(cancellationToken);

    public async Task<SignRenderOutput> RenderAsync(SignRenderRequest request, Func<SignRenderProgress, Task> progress, CancellationToken cancellationToken = default)
    {
        var settings = _settings;
        var work = Path.Combine(settings.WorkRoot, $"{request.JobId:N}-{Guid.NewGuid():N}");
        Directory.CreateDirectory(work);
        var done = false;
        try
        {
            await progress(new SignRenderProgress(SignVideo.Stage.Downloading, 1, "Đọc video bài giảng từ kho lưu trữ"));
            var source = Path.Combine(work, "source" + Extension(request.Source.ContentType));
            await DownloadAsync(request.Source.StorageKey, source, SignVideo.Errors.VideoUnreadable, "Không tìm thấy tệp video gốc trong kho lưu trữ.", cancellationToken);
            var sourceInfo = await ProbeAsync(source, work, cancellationToken)
                ?? throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không đọc được video gốc. Hãy kiểm tra tệp (MP4 H.264 là an toàn nhất).");
            _logger.LogInformation("Sign video job {JobId}: lesson video {Duration} ms, {Width}x{Height}, audio {HasAudio}",
                request.JobId, sourceInfo.DurationMs, sourceInfo.Width, sourceInfo.Height, sourceInfo.HasAudio);
            await progress(new SignRenderProgress(SignVideo.Stage.Downloading, 5,
                $"Video bài giảng {Vi(sourceInfo.DurationMs)} giây, {sourceInfo.Width}×{sourceInfo.Height}{(sourceInfo.HasAudio ? ", có âm thanh" : string.Empty)}"));

            // Sign clips, normalized once each.
            var clips = new Dictionary<Guid, NormalizedClip>();
            var videoDurations = new Dictionary<Guid, int>();
            var index = 0;
            foreach (var clip in request.Clips.Values)
            {
                await progress(new SignRenderProgress(SignVideo.Stage.PreparingClips, 5 + 25 * index / Math.Max(1, request.Clips.Count),
                    $"Chuẩn hóa video ký hiệu {index + 1}/{request.Clips.Count}: “{clip.Gloss}”"));
                var raw = Path.Combine(work, $"clip-{index}-raw{Extension(clip.Video.ContentType)}");
                await DownloadAsync(clip.Video.StorageKey, raw, SignVideo.Errors.MediaMissing,
                    $"Không tìm thấy video của ký hiệu “{clip.Gloss}” trong kho lưu trữ. Tải lại video trong Từ điển ký hiệu.", cancellationToken);
                var info = await ProbeAsync(raw, work, cancellationToken)
                    ?? throw new SignRenderException(SignVideo.Errors.VideoUnreadable, $"Không đọc được video của ký hiệu “{clip.Gloss}”.");
                videoDurations[clip.GlossId] = info.DurationMs;
                var (from, length) = TrimRange(clip.TrimStartMs, clip.TrimEndMs, info.DurationMs);
                var file = $"clip-{index}.mp4";
                var frames = Math.Max(1, (int)Math.Round(length * settings.Fps / 1000.0));
                await RunAsync(NormalizeClipArguments(settings, raw, from, length, clip.Mirrored, frames, file), work,
                    SignVideo.Errors.VideoUnreadable, $"Không xử lý được video của ký hiệu “{clip.Gloss}”.", cancellationToken);
                clips[clip.GlossId] = new NormalizedClip(file, frames);
                index++;
            }

            // Timeline on the frame grid of the output.
            var glossOf = request.Segments.SelectMany(s => s.Items).ToDictionary(i => (i.SegmentIndex, i.ItemIndex), i => i.GlossId);
            var timeline = SignTimelinePlanner.Plan(
                request.Segments.Select(s => new SignPlanSegment(
                    s.SegmentIndex, s.StartMs, s.EndMs,
                    s.Items.Select(i => new SignPlanItem(i.ItemIndex, FramesToMs(clips[i.GlossId].Frames, settings.Fps), i.TargetMs)).ToList())),
                sourceInfo.DurationMs,
                settings.MaxSpeedup);
            var pieces = PlanPieces(timeline.Placements, p => clips[glossOf[(p.SegmentIndex, p.ItemIndex)]], sourceInfo.DurationMs, settings.Fps);
            await progress(new SignRenderProgress(SignVideo.Stage.Joining, 30,
                $"Xếp {timeline.Placements.Count} ký hiệu của {request.Segments.Count} câu theo giờ lời thoại"));

            // Render each distinct piece once.
            var files = new Dictionary<string, string>();
            var list = new List<string>(pieces.Count);
            for (var i = 0; i < pieces.Count; i++)
            {
                var piece = pieces[i];
                if (!files.TryGetValue(piece.Key, out var file))
                {
                    if (piece.Clip != null && Math.Abs(piece.Speed - 1) < 0.001 && piece.Frames == piece.Clip.Frames)
                    {
                        file = piece.Clip.File;
                    }
                    else
                    {
                        file = $"piece-{files.Count}.mp4";
                        var arguments = piece.Clip == null
                            ? IdleArguments(settings, piece.Frames, file)
                            : PieceArguments(settings, piece.Clip.File, piece.Speed, piece.Frames, file);
                        await RunAsync(arguments, work, SignVideo.Errors.RenderFailed, RenderFailedMessage(request.JobId), cancellationToken);
                    }

                    files[piece.Key] = file;
                }

                list.Add(file);
                if (i % 5 == 0) await progress(new SignRenderProgress(SignVideo.Stage.Joining, 30 + 30 * i / Math.Max(1, pieces.Count), $"Ghép đoạn {i + 1}/{pieces.Count} (ký hiệu và khoảng nghỉ)"));
            }

            await File.WriteAllLinesAsync(Path.Combine(work, "pieces.txt"), list.Select(f => $"file '{f}'"), cancellationToken);
            var modeName = request.RenderMode switch
            {
                SignVideo.RenderMode.Fullscreen => "người ra dấu toàn màn hình",
                SignVideo.RenderMode.TrackOnly => "chỉ track người ra dấu",
                _ => "cửa sổ người ra dấu ở góc phải dưới",
            };
            await progress(new SignRenderProgress(SignVideo.Stage.Composing, 60, $"Dựng video đầu ra: {modeName}"));

            // Final video.
            const string output = "output.mp4";
            var compose = ComposeArguments(settings, request.RenderMode, Path.GetFileName(source), "pieces.txt", sourceInfo, output);
            var totalUs = Math.Max(1L, sourceInfo.DurationMs * 1000L);
            var lastReported = 60;
            var pending = Task.CompletedTask;
            await RunAsync(compose, work, SignVideo.Errors.RenderFailed, RenderFailedMessage(request.JobId), cancellationToken, line =>
            {
                var us = ProgressMicroseconds(line);
                if (us == null) return;
                var percent = 60 + (int)(37 * Math.Clamp((double)us.Value / totalUs, 0, 1));
                if (percent < lastReported + 3 || !pending.IsCompleted) return;
                lastReported = percent;
                pending = progress(new SignRenderProgress(SignVideo.Stage.Composing, percent,
                    $"Dựng video đầu ra: đã xong {Vi((int)Math.Min(us.Value / 1000, sourceInfo.DurationMs))}/{Vi(sourceInfo.DurationMs)} giây"));
            });
            await pending;

            await progress(new SignRenderProgress(SignVideo.Stage.Checking, 97, "Kiểm tra video đầu ra (định dạng, độ dài, kích thước)"));
            var path = Path.Combine(work, output);
            var outputInfo = await ProbeAsync(path, work, cancellationToken);
            var size = File.Exists(path) ? new FileInfo(path).Length : 0;
            if (outputInfo == null || size <= 0)
            {
                throw new SignRenderException(SignVideo.Errors.OutputInvalid, "Video ký hiệu tạo ra không đọc được. Bấm Thử lại.");
            }

            await progress(new SignRenderProgress(SignVideo.Stage.Checking, 98, $"Video hợp lệ: {Vi(outputInfo.DurationMs)} giây, {outputInfo.Width}×{outputInfo.Height}"));
            done = true;
            return new SignRenderOutput
            {
                FilePath = path,
                ContentType = "video/mp4",
                SizeBytes = size,
                DurationMs = outputInfo.DurationMs,
                Width = outputInfo.Width,
                Height = outputInfo.Height,
                VideoDurationsMs = videoDurations,
                Placements = timeline.Placements,
                Warnings = timeline.Warnings,
                Cleanup = () =>
                {
                    DeleteFolder(work);
                    return ValueTask.CompletedTask;
                },
            };
        }
        catch (FfmpegMissingException ex)
        {
            _tools.Reset();
            _logger.LogWarning(ex, "Sign video job {JobId}: FFmpeg missing", request.JobId);
            throw new SignRenderException(SignVideo.Errors.RendererNotConfigured, "Máy chủ chưa cài FFmpeg nên chưa dựng được video ký hiệu.", ex);
        }
        catch (TimeoutException ex)
        {
            throw new SignRenderException(SignVideo.Errors.JobTimeout, "Một bước dựng video chạy quá lâu nên đã dừng. Bấm Thử lại; video rất dài nên chia thành nhiều phần.", ex);
        }
        finally
        {
            if (!done) DeleteFolder(work);
        }
    }

    // ----- Plan of the pieces (pure, tested) -------------------------------------------------------

    public sealed record NormalizedClip(string File, int Frames);

    /// <summary>One piece of the signer track: a clip (or the rest background when <see cref="Clip"/> is null) for N frames.</summary>
    public sealed record Piece(NormalizedClip? Clip, double Speed, int Frames)
    {
        public string Key => Clip == null
            ? $"idle|{Frames}"
            : string.Create(CultureInfo.InvariantCulture, $"{Clip.File}|{Speed:0.###}|{Frames}");
    }

    /// <summary>
    /// The signer track as a list of pieces covering the whole lesson video, frame by frame: rests where nobody signs,
    /// the sign placements rounded to the frame grid (monotonic rounding: no gap, no overlap, no drift).
    /// </summary>
    public static List<Piece> PlanPieces(IReadOnlyList<SignPlacement> placements, Func<SignPlacement, NormalizedClip> clipOf, int videoDurationMs, int fps)
    {
        var total = Math.Max(1, (int)Math.Round(videoDurationMs * fps / 1000.0));
        var pieces = new List<Piece>();
        var cursor = 0;
        foreach (var placement in placements.OrderBy(p => p.StartMs))
        {
            var start = Math.Max(cursor, (int)Math.Round(placement.StartMs * fps / 1000.0));
            var end = Math.Min(total, (int)Math.Round(placement.EndMs * fps / 1000.0));
            if (start >= total) break;
            if (end <= start) continue;
            if (start > cursor) pieces.Add(new Piece(null, 1, start - cursor));
            pieces.Add(new Piece(clipOf(placement), placement.Speed, end - start));
            cursor = end;
        }

        if (cursor < total) pieces.Add(new Piece(null, 1, total - cursor));
        return pieces;
    }

    /// <summary>The part of the sign video holding the sign (as chosen in the dictionary), clamped to the video.</summary>
    public static (int FromMs, int LengthMs) TrimRange(int? startMs, int? endMs, int videoMs)
    {
        if (startMs is { } start && endMs is { } end && end > start && start < videoMs)
        {
            var from = Math.Max(0, start);
            var to = Math.Min(videoMs, end);
            if (to - from >= 100) return (from, to - from);
        }

        return (0, videoMs);
    }

    // ----- FFmpeg arguments (no shell; only generated file names) -----------------------------------

    private static string Seconds(int ms) => SignComposer.Seconds(ms);

    /// <summary>"8,5" — seconds for the Vietnamese progress text.</summary>
    private static string Vi(int ms) => SignComposer.Vi(ms);

    private static string TileFilter(SignVideoSettings s) => string.Create(CultureInfo.InvariantCulture,
        $"scale={s.SignWidth}:{s.SignHeight}:force_original_aspect_ratio=decrease,pad={s.SignWidth}:{s.SignHeight}:(ow-iw)/2:(oh-ih)/2:color={s.FfmpegColor},setsar=1,fps={s.Fps},format=yuv420p");

    private static IEnumerable<string> Encoder(SignVideoSettings s) => SignComposer.Encoder(s);

    private static List<string> Command(params IEnumerable<string>[] parts) => SignComposer.Command(parts);

    public static List<string> NormalizeClipArguments(SignVideoSettings s, string input, int fromMs, int lengthMs, bool mirrored, int frames, string output) =>
        Command(
            new[] { "-ss", Seconds(fromMs), "-t", Seconds(lengthMs), "-i", input, "-an", "-sn", "-dn" },
            new[] { "-vf", (mirrored ? "hflip," : string.Empty) + TileFilter(s) + string.Create(CultureInfo.InvariantCulture, $",tpad=stop_mode=clone:stop_duration={Seconds(lengthMs + 1000)}") },
            new[] { "-frames:v", frames.ToString(CultureInfo.InvariantCulture) },
            Encoder(s),
            new[] { output });

    public static List<string> PieceArguments(SignVideoSettings s, string clip, double speed, int frames, string output) =>
        Command(
            new[] { "-i", clip, "-an" },
            new[]
            {
                "-vf", string.Create(CultureInfo.InvariantCulture,
                    $"setpts=(PTS-STARTPTS)/{speed:0.###},fps={s.Fps},tpad=stop_mode=clone:stop_duration={(frames / (double)s.Fps) + 1:0.###}"),
            },
            new[] { "-frames:v", frames.ToString(CultureInfo.InvariantCulture) },
            Encoder(s),
            new[] { output });

    public static List<string> IdleArguments(SignVideoSettings s, int frames, string output) =>
        Command(
            new[] { "-f", "lavfi", "-i", string.Create(CultureInfo.InvariantCulture, $"color=c={s.FfmpegColor}:s={s.SignWidth}x{s.SignHeight}:r={s.Fps}") },
            new[] { "-vf", "setsar=1,format=yuv420p", "-frames:v", frames.ToString(CultureInfo.InvariantCulture) },
            Encoder(s),
            new[] { output });

    /// <summary>The final command for the render mode (see <see cref="SignComposer"/>). The lesson sound is mapped when there is one.</summary>
    public static List<string> ComposeArguments(SignVideoSettings s, string mode, string source, string pieceList, MediaInfo sourceInfo, string output) =>
        SignComposer.Arguments(s, mode, source, new[] { "-f", "concat", "-i", pieceList }, string.Empty, sourceInfo, output);

    /// <summary>"out_time_us=1234" / "out_time_ms=1234" (both microseconds) of FFmpeg's -progress output.</summary>
    public static long? ProgressMicroseconds(string line) => SignComposer.ProgressMicroseconds(line);

    // ----- helpers -------------------------------------------------------------------------------

    private static int FramesToMs(int frames, int fps) => (int)Math.Round(frames * 1000.0 / fps);

    /// <summary>Extension from the stored content type (never from a user file name).</summary>
    public static string Extension(string contentType) => contentType switch
    {
        "video/mp4" => ".mp4",
        "video/webm" => ".webm",
        "video/quicktime" => ".mov",
        "video/x-matroska" => ".mkv",
        _ => ".bin",
    };

    private async Task DownloadAsync(string storageKey, string path, string code, string message, CancellationToken cancellationToken)
    {
        try
        {
            await using var input = await _storage.DownloadAsync(storageKey, cancellationToken);
            await using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
            await input.CopyToAsync(file, cancellationToken);
        }
        catch (Exception ex) when (ex is NotFoundException or FileNotFoundException or DirectoryNotFoundException)
        {
            throw new SignRenderException(code, message, ex);
        }
    }

    private Task<MediaInfo?> ProbeAsync(string file, string work, CancellationToken cancellationToken) =>
        FfmpegProcess.ProbeAsync(_settings.FfprobePath, file, work, ProbeTimeout, cancellationToken);

    private async Task RunAsync(List<string> arguments, string work, string code, string message, CancellationToken cancellationToken, Action<string>? onOutputLine = null)
    {
        var result = await FfmpegProcess.RunAsync(_settings.FfmpegPath, arguments, work, TimeSpan.FromMinutes(_settings.ProcessTimeoutMinutes), cancellationToken, onOutputLine);
        if (result.ExitCode == 0) return;
        _logger.LogWarning("FFmpeg exited with {ExitCode}: {Arguments}\n{Error}", result.ExitCode, string.Join(' ', arguments), result.StandardError);
        throw new SignRenderException(code, message);
    }

    private static string RenderFailedMessage(Guid jobId) =>
        $"Dựng video ký hiệu chưa thành công (FFmpeg báo lỗi, mã việc {jobId.ToString("N")[..8]}). Bấm Thử lại; nếu vẫn lỗi, báo quản trị hệ thống kèm mã việc.";

    private void DeleteFolder(string path)
    {
        try
        {
            if (Directory.Exists(path)) Directory.Delete(path, recursive: true);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            _logger.LogWarning(ex, "Could not delete the sign video work folder {Folder}", path);
        }
    }
}
