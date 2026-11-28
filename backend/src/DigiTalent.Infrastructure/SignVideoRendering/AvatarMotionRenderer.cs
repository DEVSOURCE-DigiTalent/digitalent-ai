using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>
/// AVATAR renderer: one 3D character (the avatar of the sign dictionary) signs the whole lesson video. The avatar is
/// animated where three.js runs — the admin's browser renders it frame by frame from the dictionary motions, on the
/// lesson video's own frame grid (one avatar frame per lesson frame: nothing repeated, dropped or drifting), each sign
/// starting when its word is spoken, blended smoothly into the next and resting between sentences — and uploads the
/// track (<see cref="ISignAvatarTrackStore"/>). This renderer composes that track with the lesson video (FFmpeg: OVERLAY =
/// the avatar without background flush in the bottom corner, full screen / track as the clip renderer) and checks the
/// output. No uploaded track for the current sign
/// map = no video (SIGN_AVATAR_TRACK_MISSING / _OUTDATED): it never makes one up.
/// </summary>
public sealed class AvatarMotionRenderer : ISignVideoRenderer
{
    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromMinutes(2);

    private readonly SignVideoSettings _settings;
    private readonly IFileStorageService _storage;
    private readonly ISignAvatarTrackStore _tracks;
    private readonly ILogger<AvatarMotionRenderer> _logger;
    private readonly FfmpegToolCheck _tools;

    public AvatarMotionRenderer(
        SignVideoSettings settings,
        IFileStorageService storage,
        ISignAvatarTrackStore tracks,
        ILogger<AvatarMotionRenderer> logger,
        FfmpegToolCheck? tools = null)
    {
        _settings = settings.Sanitized();
        _storage = storage;
        _tracks = tracks;
        _logger = logger;
        _tools = tools ?? new FfmpegToolCheck(settings, Microsoft.Extensions.Logging.Abstractions.NullLogger<FfmpegToolCheck>.Instance);
    }

    public string Kind => SignVideo.Renderer.Avatar;

    /// <summary>The browser renders the avatar; the server needs FFmpeg to compose it.</summary>
    public Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default) => _tools.CheckAsync(cancellationToken);

    public async Task<SignRenderOutput> RenderAsync(SignRenderRequest request, Func<SignRenderProgress, Task> progress, CancellationToken cancellationToken = default)
    {
        var settings = _settings;
        var info = await _tracks.FindAsync(request.JobId, cancellationToken);
        var trackPath = _tracks.PathOf(request.JobId);
        if (info == null || trackPath == null)
        {
            throw new SignRenderException(SignVideo.Errors.AvatarTrackMissing,
                "Không còn track nhân vật 3D trên máy chủ. Bấm “Tạo video ký hiệu” để dựng lại nhân vật.");
        }

        if (request.Fingerprint != null && info.Fingerprint != request.Fingerprint)
        {
            throw new SignRenderException(SignVideo.Errors.AvatarTrackOutdated,
                "Track nhân vật 3D được dựng từ bản đồ ký hiệu cũ. Bấm “Tạo video ký hiệu” để dựng lại nhân vật.");
        }

        // OVERLAY needs the transparent track (a track kept from before it, on a background, is rendered again).
        var transparent = SignVideo.AvatarTrack.IsTransparent(request.RenderMode);
        if (info.Transparent != transparent)
        {
            throw new SignRenderException(SignVideo.Errors.AvatarTrackOutdated,
                "Track nhân vật 3D được dựng cho cách hiển thị khác. Bấm “Tạo video ký hiệu” để dựng lại nhân vật.");
        }

        var work = Path.Combine(settings.WorkRoot, $"{request.JobId:N}-{Guid.NewGuid():N}");
        Directory.CreateDirectory(work);
        var done = false;
        try
        {
            await progress(new SignRenderProgress(SignVideo.Stage.Downloading, 1, "Đọc video bài giảng từ kho lưu trữ"));
            var source = Path.Combine(work, "source" + ClipSequenceRenderer.Extension(request.Source.ContentType));
            try
            {
                await using var input = await _storage.DownloadAsync(request.Source.StorageKey, cancellationToken);
                await using var file = new FileStream(source, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
                await input.CopyToAsync(file, cancellationToken);
            }
            catch (Exception ex) when (ex is NotFoundException or FileNotFoundException or DirectoryNotFoundException)
            {
                throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không tìm thấy tệp video gốc trong kho lưu trữ.", ex);
            }

            var sourceInfo = await FfmpegProcess.ProbeAsync(settings.FfprobePath, source, work, ProbeTimeout, cancellationToken)
                ?? throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không đọc được video gốc. Hãy kiểm tra tệp (MP4 H.264 là an toàn nhất).");
            await progress(new SignRenderProgress(SignVideo.Stage.Downloading, 8,
                $"Video bài giảng {SignComposer.Vi(sourceInfo.DurationMs)} giây, {sourceInfo.Width}×{sourceInfo.Height}{(sourceInfo.HasAudio ? ", có âm thanh" : string.Empty)}"));

            // The track must sit on the lesson's frame grid, else the window would repeat or drop frames (judder).
            var (rate, fps) = FrameRates.ForTrack(sourceInfo.FrameRate);
            var expected = FrameRates.FrameCount(sourceInfo.DurationMs, fps);
            await progress(new SignRenderProgress(SignVideo.Stage.PreparingClips, 15,
                $"Đọc track nhân vật 3D: {info.FrameCount} khung hình, {(info.Format == SignVideo.AvatarTrack.H264 ? "H.264" : "VP8/VP9")}, {SignComposer.Vi((int)(info.SizeBytes / 1024))} KB"));
            if (info.FrameRate != rate || Math.Abs(info.FrameCount - expected) > SignVideo.AvatarTrack.FrameTolerance)
            {
                throw new SignRenderException(SignVideo.Errors.AvatarTrackInvalid,
                    $"Track nhân vật ({info.FrameCount} khung, {info.FrameRate} khung/giây) không khớp video bài giảng ({expected} khung, {rate} khung/giây). Bấm “Tạo video ký hiệu” để dựng lại nhân vật.");
            }

            await progress(new SignRenderProgress(SignVideo.Stage.Joining, 25,
                $"Khớp nhân vật với video bài giảng: {info.Placements.Count} ký hiệu, {expected} khung hình ở {SignComposer.Vi((int)Math.Round(fps * 1000))} khung/giây"));

            var signerInput = info.Format == SignVideo.AvatarTrack.Ivf
                ? new[] { "-f", "ivf", "-i", trackPath }
                : new[] { "-f", "h264", "-framerate", rate, "-i", trackPath };
            // A track a frame short holds its last frame to the end of the lesson instead of leaving the window empty.
            var prep = "tpad=stop_mode=clone:stop_duration=2,";
            const string output = "output.mp4";
            var modeName = request.RenderMode switch
            {
                SignVideo.RenderMode.Fullscreen => "nhân vật toàn màn hình",
                SignVideo.RenderMode.TrackOnly => "chỉ track nhân vật",
                _ => $"nhân vật nền trong suốt ở góc {(settings.WindowSide == "RIGHT" ? "phải" : "trái")} dưới",
            };
            await progress(new SignRenderProgress(SignVideo.Stage.Composing, 30, $"Dựng video đầu ra: {modeName}"));
            var arguments = SignComposer.Arguments(settings, request.RenderMode, Path.GetFileName(source), signerInput, prep, sourceInfo, output, transparent);
            var totalUs = Math.Max(1L, sourceInfo.DurationMs * 1000L);
            var lastReported = 30;
            var pending = Task.CompletedTask;
            var result = await FfmpegProcess.RunAsync(settings.FfmpegPath, arguments, work, TimeSpan.FromMinutes(settings.ProcessTimeoutMinutes), cancellationToken, line =>
            {
                var us = SignComposer.ProgressMicroseconds(line);
                if (us == null) return;
                var percent = 30 + (int)(66 * Math.Clamp((double)us.Value / totalUs, 0, 1));
                if (percent < lastReported + 3 || !pending.IsCompleted) return;
                lastReported = percent;
                pending = progress(new SignRenderProgress(SignVideo.Stage.Composing, percent,
                    $"Dựng video đầu ra: đã xong {SignComposer.Vi((int)Math.Min(us.Value / 1000, sourceInfo.DurationMs))}/{SignComposer.Vi(sourceInfo.DurationMs)} giây"));
            });
            await pending;
            if (result.ExitCode != 0)
            {
                _logger.LogWarning("FFmpeg exited with {ExitCode} composing the avatar of {JobId}\n{Error}", result.ExitCode, request.JobId, result.StandardError);
                throw new SignRenderException(SignVideo.Errors.RenderFailed,
                    $"Ghép nhân vật 3D vào video chưa thành công (FFmpeg báo lỗi, mã việc {request.JobId.ToString("N")[..8]}). Bấm “Tạo video ký hiệu” để dựng lại; nếu vẫn lỗi, báo quản trị hệ thống kèm mã việc.");
            }

            await progress(new SignRenderProgress(SignVideo.Stage.Checking, 97, "Kiểm tra video đầu ra (định dạng, độ dài, kích thước)"));
            var path = Path.Combine(work, output);
            var outputInfo = await FfmpegProcess.ProbeAsync(settings.FfprobePath, path, work, ProbeTimeout, cancellationToken);
            var size = File.Exists(path) ? new FileInfo(path).Length : 0;
            if (outputInfo == null || size <= 0)
            {
                throw new SignRenderException(SignVideo.Errors.OutputInvalid, "Video ký hiệu tạo ra không đọc được. Bấm “Tạo video ký hiệu” để dựng lại.");
            }

            await progress(new SignRenderProgress(SignVideo.Stage.Checking, 98, $"Video hợp lệ: {SignComposer.Vi(outputInfo.DurationMs)} giây, {outputInfo.Width}×{outputInfo.Height}"));
            done = true;
            return new SignRenderOutput
            {
                FilePath = path,
                ContentType = "video/mp4",
                SizeBytes = size,
                DurationMs = outputInfo.DurationMs,
                Width = outputInfo.Width,
                Height = outputInfo.Height,
                Placements = info.Placements,
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
            throw new SignRenderException(SignVideo.Errors.RendererNotConfigured, "Máy chủ chưa cài FFmpeg nên chưa dựng được video ký hiệu.", ex);
        }
        catch (TimeoutException ex)
        {
            throw new SignRenderException(SignVideo.Errors.JobTimeout, "Ghép nhân vật vào video chạy quá lâu nên đã dừng. Bấm “Tạo video ký hiệu” để thử lại.", ex);
        }
        finally
        {
            if (!done) DeleteFolder(work);
        }
    }

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
