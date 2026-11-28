using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// What was published (platform_sign_language_tracks.published_snapshot, jsonb): the settings, the render and every
/// sentence with its signs and review, so "Hủy bản nháp" can bring the draft back to it.
/// </summary>
public sealed class SignVideoSnapshot
{
    public string CaptionSource { get; set; } = string.Empty;
    public string CaptionFingerprint { get; set; } = string.Empty;
    public string RenderMode { get; set; } = string.Empty;
    public string Renderer { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public string Settings { get; set; } = "{}";
    public string? RenderedFingerprint { get; set; }
    public int? OutputDurationMs { get; set; }
    public int? OutputWidth { get; set; }
    public int? OutputHeight { get; set; }
    public DateTimeOffset? RenderedAt { get; set; }
    public List<SnapshotSegment> Segments { get; set; } = new();

    public sealed class SnapshotSegment
    {
        public int Index { get; set; }
        public string CaptionText { get; set; } = string.Empty;
        public int StartMs { get; set; }
        public int EndMs { get; set; }
        public List<SignSequenceItem> Items { get; set; } = new();
        public string ReviewStatus { get; set; } = string.Empty;
        public string? ReviewNote { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public DateTimeOffset? ReviewedAt { get; set; }
    }

    public static SignVideoSnapshot Of(PlatformSignLanguageTrack track, IEnumerable<SignSegmentState> segments) => new()
    {
        CaptionSource = track.CaptionSource,
        CaptionFingerprint = track.CaptionFingerprint,
        RenderMode = track.RenderMode,
        Renderer = track.Renderer,
        Region = track.Region,
        Variant = track.Variant,
        Settings = track.Settings,
        RenderedFingerprint = track.RenderedFingerprint,
        OutputDurationMs = track.OutputDurationMs,
        OutputWidth = track.OutputWidth,
        OutputHeight = track.OutputHeight,
        RenderedAt = track.RenderedAt,
        Segments = segments.OrderBy(s => s.Row.SegmentIndex).Select(s => new SnapshotSegment
        {
            Index = s.Row.SegmentIndex,
            CaptionText = s.Row.CaptionText,
            StartMs = s.Row.StartMs,
            EndMs = s.Row.EndMs,
            Items = s.Items,
            ReviewStatus = s.Row.ReviewStatus,
            ReviewNote = s.Row.ReviewNote,
            ReviewedByUserId = s.Row.ReviewedByUserId,
            ReviewedAt = s.Row.ReviewedAt,
        }).ToList(),
    };
}
