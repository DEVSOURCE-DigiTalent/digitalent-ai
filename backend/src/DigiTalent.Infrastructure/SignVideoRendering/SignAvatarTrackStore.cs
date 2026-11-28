using System.Collections.Concurrent;
using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>
/// Avatar tracks uploaded by the admin's browser, one per sign-language track, kept in the render work folder
/// ({work}/avatar-tracks/{trackId}.track + .json) until the composition succeeds (single API instance, like the render
/// worker). File names are generated from the track id; the content is checked to start like the declared format.
/// The spec of a lesson video (frame rate, frames) is read once with ffprobe and cached by storage key.
/// </summary>
public sealed class SignAvatarTrackStore : ISignAvatarTrackStore
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromMinutes(2);

    private readonly SignVideoSettings _settings;
    private readonly IFileStorageService _storage;
    private readonly ILogger<SignAvatarTrackStore> _logger;
    private readonly ConcurrentDictionary<string, LessonGrid> _grids = new();

    /// <summary>What ffprobe told about a lesson video: its frame grid and picture size.</summary>
    private sealed record LessonGrid(string Rate, double Fps, int FrameCount, int DurationMs, int Width, int Height);

    public SignAvatarTrackStore(SignVideoSettings settings, IFileStorageService storage, ILogger<SignAvatarTrackStore> logger)
    {
        _settings = settings.Sanitized();
        _storage = storage;
        _logger = logger;
    }

    private string Folder => Path.Combine(_settings.WorkRoot, "avatar-tracks");

    private string TrackFile(Guid trackId) => Path.Combine(Folder, $"{trackId:N}.track");

    private string InfoFile(Guid trackId) => Path.Combine(Folder, $"{trackId:N}.json");

    public async Task<SignAvatarTrackSpec> SpecAsync(SignRenderMedia source, string renderMode, CancellationToken cancellationToken = default)
    {
        var grid = await GridAsync(source, cancellationToken);
        if (!SignVideo.AvatarTrack.IsTransparent(renderMode))
        {
            return new SignAvatarTrackSpec(grid.Rate, grid.Fps, grid.FrameCount, grid.DurationMs,
                _settings.SignWidth, _settings.SignHeight, _settings.AvatarBackgroundColor);
        }

        // Transparent: rendered at the size of its place on this lesson video, so the composition does not rescale it.
        var (width, height) = SignComposer.AvatarTile(_settings, grid.Width, grid.Height);
        return new SignAvatarTrackSpec(grid.Rate, grid.Fps, grid.FrameCount, grid.DurationMs,
            width, height, _settings.AvatarBackgroundColor, Transparent: true, Side: _settings.WindowSide);
    }

    private async Task<LessonGrid> GridAsync(SignRenderMedia source, CancellationToken cancellationToken)
    {
        if (_grids.TryGetValue(source.StorageKey, out var cached)) return cached;

        Directory.CreateDirectory(Folder);
        var probeFile = Path.Combine(Folder, $"probe-{Guid.NewGuid():N}{ClipSequenceRenderer.Extension(source.ContentType)}");
        try
        {
            try
            {
                await using var input = await _storage.DownloadAsync(source.StorageKey, cancellationToken);
                await using var file = new FileStream(probeFile, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
                await input.CopyToAsync(file, cancellationToken);
            }
            catch (Exception ex) when (ex is NotFoundException or FileNotFoundException or DirectoryNotFoundException)
            {
                throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không tìm thấy tệp video gốc trong kho lưu trữ.", ex);
            }

            MediaInfo? info;
            try
            {
                info = await FfmpegProcess.ProbeAsync(_settings.FfprobePath, probeFile, Folder, ProbeTimeout, cancellationToken);
            }
            catch (FfmpegMissingException ex)
            {
                throw new SignRenderException(SignVideo.Errors.RendererNotConfigured, "Máy chủ chưa cài FFmpeg nên chưa dựng được video ký hiệu.", ex);
            }

            if (info == null)
            {
                throw new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không đọc được video gốc. Hãy kiểm tra tệp (MP4 H.264 là an toàn nhất).");
            }

            var (rate, fps) = FrameRates.ForTrack(info.FrameRate);
            var grid = new LessonGrid(rate, fps, FrameRates.FrameCount(info.DurationMs, fps), info.DurationMs, info.Width, info.Height);
            _grids[source.StorageKey] = grid;
            _logger.LogInformation("Avatar track grid of {AssetId}: {Rate} fps ({Source}), {Frames} frames, lesson {Width}x{Height}",
                source.AssetId, rate, info.FrameRate ?? "?", grid.FrameCount, grid.Width, grid.Height);
            return grid;
        }
        finally
        {
            TryDelete(probeFile);
        }
    }

    public async Task SaveAsync(Guid trackId, Stream content, SignAvatarTrackInfo info, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(Folder);
        var temp = Path.Combine(Folder, $"{trackId:N}-{Guid.NewGuid():N}.upload");
        try
        {
            long written;
            await using (var file = new FileStream(temp, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
            {
                await content.CopyToAsync(file, cancellationToken);
                written = file.Length;
            }

            if (written <= 0 || written > SignVideo.AvatarTrack.MaxBytes)
            {
                throw new SignRenderException(SignVideo.Errors.AvatarTrackInvalid, "Track nhân vật rỗng hoặc vượt quá 500 MB.");
            }

            if (!await StartsLikeAsync(temp, info.Format, cancellationToken))
            {
                throw new SignRenderException(SignVideo.Errors.AvatarTrackInvalid,
                    info.Format == SignVideo.AvatarTrack.H264 ? "Tệp tải lên không phải luồng H.264." : "Tệp tải lên không phải tệp IVF (VP8/VP9).");
            }

            await DeleteAsync(trackId, cancellationToken);
            File.Move(temp, TrackFile(trackId));
            await File.WriteAllTextAsync(InfoFile(trackId), JsonSerializer.Serialize(info with { SizeBytes = written }, Json), cancellationToken);
            _logger.LogInformation("Avatar track of {TrackId} stored: {Bytes} bytes, {Format}, {Frames} frames at {Rate}", trackId, written, info.Format, info.FrameCount, info.FrameRate);
        }
        finally
        {
            TryDelete(temp);
        }
    }

    public async Task<SignAvatarTrackInfo?> FindAsync(Guid trackId, CancellationToken cancellationToken = default)
    {
        if (!File.Exists(TrackFile(trackId)) || !File.Exists(InfoFile(trackId))) return null;
        try
        {
            return JsonSerializer.Deserialize<SignAvatarTrackInfo>(await File.ReadAllTextAsync(InfoFile(trackId), cancellationToken), Json);
        }
        catch (Exception ex) when (ex is JsonException or IOException)
        {
            _logger.LogWarning(ex, "Unreadable avatar track info of {TrackId}", trackId);
            return null;
        }
    }

    public string? PathOf(Guid trackId) => File.Exists(TrackFile(trackId)) ? TrackFile(trackId) : null;

    public Task DeleteAsync(Guid trackId, CancellationToken cancellationToken = default)
    {
        TryDelete(TrackFile(trackId));
        TryDelete(InfoFile(trackId));
        return Task.CompletedTask;
    }

    /// <summary>H.264 Annex B begins with a start code (00 00 01 / 00 00 00 01); IVF with "DKIF".</summary>
    private static async Task<bool> StartsLikeAsync(string path, string format, CancellationToken cancellationToken)
    {
        var head = new byte[4];
        await using var file = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        var read = await file.ReadAsync(head, cancellationToken);
        if (read < 4) return false;
        return format == SignVideo.AvatarTrack.Ivf
            ? head[0] == 'D' && head[1] == 'K' && head[2] == 'I' && head[3] == 'F'
            : head[0] == 0 && head[1] == 0 && (head[2] == 1 || (head[2] == 0 && head[3] == 1));
    }

    private void TryDelete(string path)
    {
        try
        {
            if (File.Exists(path)) File.Delete(path);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            _logger.LogWarning(ex, "Could not delete {File}", path);
        }
    }
}
