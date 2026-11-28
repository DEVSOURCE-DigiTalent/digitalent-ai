using System.Globalization;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>
/// Whether FFmpeg can make browser-playable MP4 here (ffmpeg with libx264 and ffprobe run): shared by both renderers,
/// cached 10 minutes when ready, 1 minute when not (so an install is seen soon).
/// </summary>
public sealed class FfmpegToolCheck
{
    private static readonly TimeSpan CheckTimeout = TimeSpan.FromSeconds(20);

    private readonly SignVideoSettings _settings;
    private readonly ILogger<FfmpegToolCheck> _logger;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private SignRendererStatus? _status;
    private DateTimeOffset _checkedAt;

    public FfmpegToolCheck(SignVideoSettings settings, ILogger<FfmpegToolCheck> logger)
    {
        _settings = settings.Sanitized();
        _logger = logger;
    }

    public async Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            return new SignRendererStatus(false, "Bộ dựng video ký hiệu đang tắt trong cấu hình máy chủ (SignVideo:Enabled).");
        }

        var cached = _status;
        if (cached != null && DateTimeOffset.UtcNow - _checkedAt < (cached.Available ? TimeSpan.FromMinutes(10) : TimeSpan.FromMinutes(1)))
        {
            return cached;
        }

        await _lock.WaitAsync(cancellationToken);
        try
        {
            _status = await ProbeAsync(cancellationToken);
            _checkedAt = DateTimeOffset.UtcNow;
            return _status;
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>Forget the cached answer (FFmpeg vanished during a render).</summary>
    public void Reset() => _status = null;

    private async Task<SignRendererStatus> ProbeAsync(CancellationToken cancellationToken)
    {
        var directory = Path.GetTempPath();
        try
        {
            // The encoder list is longer than what is kept of the output: look for H.264 while it is read.
            var hasH264 = false;
            var encoders = await FfmpegProcess.RunAsync(_settings.FfmpegPath, new[] { "-hide_banner", "-encoders" }, directory, CheckTimeout, cancellationToken,
                line => hasH264 |= line.Contains(" libx264 ", StringComparison.Ordinal));
            var probe = await FfmpegProcess.RunAsync(_settings.FfprobePath, new[] { "-version" }, directory, CheckTimeout, cancellationToken);
            if (encoders.ExitCode != 0 || probe.ExitCode != 0)
            {
                _logger.LogWarning("FFmpeg check failed: ffmpeg exit {FfmpegExit}, ffprobe exit {FfprobeExit}", encoders.ExitCode, probe.ExitCode);
                return new SignRendererStatus(false, "FFmpeg trên máy chủ không chạy được. Kiểm tra cài đặt FFmpeg (SignVideo:FfmpegPath, SignVideo:FfprobePath).");
            }

            if (!hasH264)
            {
                return new SignRendererStatus(false, "FFmpeg trên máy chủ thiếu bộ mã hóa libx264 nên không tạo được video MP4 phát trên trình duyệt.");
            }

            return SignRendererStatus.Ready;
        }
        catch (Exception ex) when (ex is FfmpegMissingException or TimeoutException)
        {
            _logger.LogWarning(ex, "FFmpeg is not available for sign-language videos");
            return new SignRendererStatus(false, "Máy chủ chưa cài FFmpeg (không tìm thấy ffmpeg/ffprobe) nên chưa dựng được video ký hiệu. Xem hướng dẫn cài đặt.");
        }
    }
}

/// <summary>Frame rates of the lesson video, as FFmpeg reads them and as the avatar track must match them.</summary>
public static class FrameRates
{
    private static readonly (string Text, double Value)[] Common =
    {
        ("24000/1001", 24000 / 1001.0), ("24", 24), ("25", 25), ("30000/1001", 30000 / 1001.0), ("30", 30),
        ("50", 50), ("60000/1001", 60000 / 1001.0), ("60", 60),
    };

    /// <summary>"30000/1001" → 29.97, "25" → 25; null when not a rate.</summary>
    public static double? Parse(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var parts = text.Split('/');
        if (!double.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var numerator)) return null;
        var denominator = 1.0;
        if (parts.Length == 2 && !double.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out denominator)) return null;
        if (parts.Length > 2 || denominator <= 0) return null;
        var value = numerator / denominator;
        return value > 0 && double.IsFinite(value) ? value : null;
    }

    /// <summary>
    /// The rate the avatar track is rendered at: a usual rate when the video is close to one (29.97, 25…), else the
    /// rate rounded to whole frames between 10 and 60 (screen recordings have uneven rates; 120 fps → 60).
    /// </summary>
    public static (string Text, double Value) ForTrack(string? videoRate)
    {
        var value = Parse(videoRate);
        if (value == null) return ("25", 25);
        foreach (var common in Common)
        {
            if (Math.Abs(common.Value - value.Value) < 0.02) return common;
        }

        var whole = (int)Math.Clamp(Math.Round(value.Value), 10, 60);
        return (whole.ToString(CultureInfo.InvariantCulture), whole);
    }

    /// <summary>Frames of a video of this length at this rate.</summary>
    public static int FrameCount(int durationMs, double fps) => Math.Max(1, (int)Math.Round(durationMs * fps / 1000.0));
}
