using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Makes the sign-language video of a lesson video (docs/specs/2026-11-24-sign-language-video.md). Infrastructure
/// provides <c>CLIP</c> (dictionary clips of one real person joined with FFmpeg) and <c>AVATAR</c> (the 3D avatar track
/// rendered by the admin's browser, composed with FFmpeg; without an uploaded track it produces nothing). A renderer
/// never fakes an output: no tool, no video.
/// </summary>
public interface ISignVideoRenderer
{
    /// <summary><see cref="Domain.Constants.SignVideo.Renderer"/> value served by this renderer.</summary>
    string Kind { get; }

    /// <summary>Whether the renderer can run on this server (tools installed, enabled); cheap, cached by the renderer.</summary>
    Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Renders the video. <paramref name="progress"/> receives the step (<see cref="Domain.Constants.SignVideo.Stage"/>),
    /// 0–100 and a Vietnamese detail the builder shows. Throws <see cref="SignRenderException"/> for a known failure
    /// (code = platform_sign_language_tracks.error_code). The caller disposes the output, which deletes the temporary files.
    /// </summary>
    Task<SignRenderOutput> RenderAsync(SignRenderRequest request, Func<SignRenderProgress, Task> progress, CancellationToken cancellationToken = default);
}

/// <summary>Where a render is: step, percent of the whole render, what is being done (e.g. "Chuẩn hóa ký hiệu 2/5: “bạn”").</summary>
public sealed record SignRenderProgress(string Stage, int Percent, string? Detail = null);

public sealed record SignRendererStatus(bool Available, string? Message)
{
    public static readonly SignRendererStatus Ready = new(true, null);
}

/// <summary>A stored video read by the renderer (the lesson video or the video of a sign).</summary>
public sealed record SignRenderMedia(Guid AssetId, string StorageKey, string ContentType);

/// <summary>The clip of one sign: its video, the part of it that holds the sign (when set) and whether it is mirrored.</summary>
public sealed record SignRenderClip(Guid GlossId, string Gloss, SignRenderMedia Video, int? TrimStartMs, int? TrimEndMs, bool Mirrored);

/// <summary>One sign to show: which clip, and the length the admin gave it (null = the clip's own length).</summary>
public sealed record SignRenderItem(int SegmentIndex, int ItemIndex, Guid GlossId, int? TargetMs);

/// <summary>One caption sentence and its signs, in order (skipped signs and skipped sentences are left out).</summary>
public sealed record SignRenderSegment(int SegmentIndex, int StartMs, int EndMs, IReadOnlyList<SignRenderItem> Items);

/// <param name="JobId">The track id.</param>
/// <param name="Fingerprint">What the render depends on (<c>SignVideoRules.RenderFingerprint</c>): an avatar track rendered
/// for another fingerprint is refused.</param>
public sealed record SignRenderRequest(
    Guid JobId,
    SignRenderMedia Source,
    string RenderMode,
    IReadOnlyDictionary<Guid, SignRenderClip> Clips,
    IReadOnlyList<SignRenderSegment> Segments,
    string? Fingerprint = null);

/// <summary>The rendered file in a temporary folder; disposing it deletes the folder.</summary>
public sealed class SignRenderOutput : IAsyncDisposable
{
    public required string FilePath { get; init; }
    public required string ContentType { get; init; }
    public required long SizeBytes { get; init; }
    public required int DurationMs { get; init; }
    public required int Width { get; init; }
    public required int Height { get; init; }
    /// <summary>Measured length of the whole video of each sign, by gloss id (cached on sign_glosses.video_duration_ms).</summary>
    public IReadOnlyDictionary<Guid, int> VideoDurationsMs { get; init; } = new Dictionary<Guid, int>();
    /// <summary>Where each sign landed on the video timeline.</summary>
    public IReadOnlyList<SignPlacement> Placements { get; init; } = Array.Empty<SignPlacement>();
    public IReadOnlyList<string> Warnings { get; init; } = Array.Empty<string>();
    public Func<ValueTask>? Cleanup { get; init; }

    public Stream OpenRead() => new FileStream(FilePath, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, useAsync: true);

    public ValueTask DisposeAsync() => Cleanup?.Invoke() ?? ValueTask.CompletedTask;
}

/// <summary>A render that failed for a known reason. <see cref="Exception.Message"/> is Vietnamese, safe to show (no path).</summary>
public sealed class SignRenderException : Exception
{
    public SignRenderException(string code, string message, Exception? inner = null) : base(message, inner)
    {
        Code = code;
    }

    public string Code { get; }
}

/// <summary>
/// Runs sign-video renders outside the request (Infrastructure: in-process queue + background worker). Renders still
/// RENDERING when the server stops are started again when it starts.
/// </summary>
public interface ISignVideoJobQueue
{
    void Enqueue(Guid trackId);
}

/// <summary>
/// What the avatar track must be to match the lesson video frame for frame: frame rate ("30000/1001" for FFmpeg and its
/// value for the browser), number of frames, tile size and background. Read from the lesson video (ffprobe).
/// <see cref="Transparent"/> (OVERLAY): no background, frames twice as wide (colour | alpha, see
/// <see cref="DigiTalent.Domain.Constants.SignVideo.AvatarTrack.IsTransparent"/>), the tile = the avatar's place on the lesson video
/// and the avatar framed toward <see cref="Side"/> ("LEFT" / "RIGHT"), the corner it stands in.
/// </summary>
public sealed record SignAvatarTrackSpec(
    string FrameRate,
    double Fps,
    int FrameCount,
    int DurationMs,
    int Width,
    int Height,
    string Background,
    bool Transparent = false,
    string Side = "LEFT");

/// <summary>An uploaded avatar track: the sign map it was rendered from, its format, frames and where each sign landed.</summary>
public sealed record SignAvatarTrackInfo(
    string Fingerprint,
    string Format,
    string FrameRate,
    int FrameCount,
    long SizeBytes,
    IReadOnlyList<SignPlacement> Placements,
    DateTimeOffset UploadedAt,
    bool Transparent = false);

/// <summary>
/// Avatar tracks waiting for composition (Infrastructure keeps one file per sign-language track in the render work
/// folder; single API instance, like the render worker) and the spec a new track must meet.
/// </summary>
public interface ISignAvatarTrackStore
{
    /// <summary>Frame rate, frames and tile of the avatar track for this lesson video shown in <paramref name="renderMode"/>. Throws <see cref="SignRenderException"/> when the video cannot be read.</summary>
    Task<SignAvatarTrackSpec> SpecAsync(SignRenderMedia source, string renderMode, CancellationToken cancellationToken = default);

    /// <summary>Stores the track of a sign-language track, replacing the previous one.</summary>
    Task SaveAsync(Guid trackId, Stream content, SignAvatarTrackInfo info, CancellationToken cancellationToken = default);

    Task<SignAvatarTrackInfo?> FindAsync(Guid trackId, CancellationToken cancellationToken = default);

    /// <summary>Local path of the stored track (for FFmpeg); null when there is none.</summary>
    string? PathOf(Guid trackId);

    Task DeleteAsync(Guid trackId, CancellationToken cancellationToken = default);
}
