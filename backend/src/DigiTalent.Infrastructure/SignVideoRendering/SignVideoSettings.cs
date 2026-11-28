using System.Text.RegularExpressions;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>
/// Settings section "SignVideo" (docs/specs/2026-11-24-sign-language-video.md, "Cài đặt"). Paths come from the
/// configuration, never from a developer machine: by default ffmpeg/ffprobe are looked up on PATH and the work folder
/// is under the system temp folder. Invalid values fall back to the defaults (<see cref="Sanitized"/>).
/// </summary>
public sealed partial class SignVideoSettings
{
    public const string SectionName = "SignVideo";

    private static readonly string[] Presets = { "ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow" };

    /// <summary>false = the clip renderer reports SIGN_RENDERER_NOT_CONFIGURED.</summary>
    public bool Enabled { get; set; } = true;
    public string FfmpegPath { get; set; } = "ffmpeg";
    public string FfprobePath { get; set; } = "ffprobe";
    /// <summary>Folder for the per-job temporary files (empty = {system temp}/digitalent-sign-video).</summary>
    public string? WorkDirectory { get; set; }
    public int Fps { get; set; } = 25;
    /// <summary>Size of the signer tile (portrait: the signing space is taller than wide).</summary>
    public int SignWidth { get; set; } = 480;
    public int SignHeight { get; set; } = 540;
    /// <summary>OVERLAY: height of the signer window, in % of the lesson video height (the signer must stay readable).</summary>
    public double WindowHeightPercent { get; set; } = 50;
    /// <summary>OVERLAY: widest the signer window may be, in % of the lesson video width (portrait or square videos).</summary>
    public double WindowWidthPercent { get; set; } = 36;
    /// <summary>OVERLAY: corner of the signer window, "LEFT" (bottom left, default) or "RIGHT" (bottom right).</summary>
    public string WindowSide { get; set; } = "LEFT";
    /// <summary>OVERLAY: gap between the window and the edges, in % of the smaller side of the lesson video.</summary>
    public double MarginPercent { get; set; } = 3;
    /// <summary>
    /// OVERLAY with the 3D avatar: height of the avatar's frame, in % of the lesson video height. The avatar has no
    /// background and stands flush in the bottom corner (<see cref="WindowSide"/>), cut at the hips by the bottom edge;
    /// from the top of its head to that edge it is about ¾ of this height (the rest is room for raised hands).
    /// </summary>
    public double AvatarWindowHeightPercent { get; set; } = 60;
    /// <summary>Background behind the signer and while the signer rests ("#RRGGBB").</summary>
    public string BackgroundColor { get; set; } = "#1E293B";
    /// <summary>Background the browser paints behind the 3D avatar in FULLSCREEN / TRACK_ONLY ("#RRGGBB", light so the hands read well).</summary>
    public string AvatarBackgroundColor { get; set; } = "#E9EEF5";
    public int Crf { get; set; } = 23;
    public string Preset { get; set; } = "veryfast";
    public double MaxSpeedup { get; set; } = 1.5;
    /// <summary>Longest a single FFmpeg command may run.</summary>
    public int ProcessTimeoutMinutes { get; set; } = 30;
    /// <summary>Longest a whole render may run before it is stopped (SIGN_JOB_TIMEOUT).</summary>
    public int JobTimeoutMinutes { get; set; } = 120;
    /// <summary>Renders running at the same time (FFmpeg is CPU-heavy; 1 keeps the API responsive).</summary>
    public int MaxConcurrentJobs { get; set; } = 1;

    public SignVideoSettings Sanitized() => new()
    {
        Enabled = Enabled,
        FfmpegPath = string.IsNullOrWhiteSpace(FfmpegPath) ? "ffmpeg" : FfmpegPath.Trim(),
        FfprobePath = string.IsNullOrWhiteSpace(FfprobePath) ? "ffprobe" : FfprobePath.Trim(),
        WorkDirectory = string.IsNullOrWhiteSpace(WorkDirectory) ? null : WorkDirectory.Trim(),
        Fps = Fps is >= 10 and <= 60 ? Fps : 25,
        SignWidth = Even(SignWidth is >= 160 and <= 1920 ? SignWidth : 480),
        SignHeight = Even(SignHeight is >= 160 and <= 1920 ? SignHeight : 540),
        WindowHeightPercent = WindowHeightPercent is >= 20 and <= 80 ? WindowHeightPercent : 50,
        WindowWidthPercent = WindowWidthPercent is >= 10 and <= 60 ? WindowWidthPercent : 36,
        WindowSide = string.Equals(WindowSide?.Trim(), "RIGHT", StringComparison.OrdinalIgnoreCase) ? "RIGHT" : "LEFT",
        MarginPercent = MarginPercent is >= 0 and <= 10 ? MarginPercent : 3,
        AvatarWindowHeightPercent = AvatarWindowHeightPercent is >= 30 and <= 90 ? AvatarWindowHeightPercent : 60,
        BackgroundColor = Color().IsMatch(BackgroundColor ?? string.Empty) ? BackgroundColor! : "#1E293B",
        AvatarBackgroundColor = Color().IsMatch(AvatarBackgroundColor ?? string.Empty) ? AvatarBackgroundColor!.ToUpperInvariant() : "#E9EEF5",
        Crf = Crf is >= 15 and <= 40 ? Crf : 23,
        Preset = Presets.Contains(Preset) ? Preset : "veryfast",
        MaxSpeedup = MaxSpeedup is >= 1 and <= 3 ? MaxSpeedup : 1.5,
        ProcessTimeoutMinutes = ProcessTimeoutMinutes is >= 1 and <= 240 ? ProcessTimeoutMinutes : 30,
        JobTimeoutMinutes = JobTimeoutMinutes is >= 5 and <= 720 ? JobTimeoutMinutes : 120,
        MaxConcurrentJobs = MaxConcurrentJobs is >= 1 and <= 4 ? MaxConcurrentJobs : 1,
    };

    /// <summary>"#1E293B" → "0x1E293B" (FFmpeg colour syntax).</summary>
    public string FfmpegColor => "0x" + BackgroundColor.TrimStart('#');

    public string WorkRoot => WorkDirectory is { Length: > 0 }
        ? Path.GetFullPath(WorkDirectory)
        : Path.Combine(Path.GetTempPath(), "digitalent-sign-video");

    private static int Even(int value) => value - value % 2;

    [GeneratedRegex("^#[0-9A-Fa-f]{6}$")]
    private static partial Regex Color();
}
