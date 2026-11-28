using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_sign_language_tracks (schema v3.13): the sign-language video of one lesson video in one sign language.
/// The draft (segments + OutputAssetId) is what the Platform Admin edits and renders; learners see only the published
/// output (PublishedOutputAssetId), which stays while the draft changes. Captions are never modified by it.
/// </summary>
public class PlatformSignLanguageTrack : BaseEntity
{
    public Guid SourceAssetId { get; set; }
    /// <summary>Language of the captions read (vi).</summary>
    public string Language { get; set; } = string.Empty;
    public string SignLanguage { get; set; } = string.Empty;
    /// <summary>Preferred region when a word has several signs (VN = cả nước).</summary>
    public string Region { get; set; } = string.Empty;
    public string? Variant { get; set; }
    /// <summary>PUBLISHED / DRAFT copy of the captions the segments come from.</summary>
    public string CaptionSource { get; set; } = string.Empty;
    /// <summary>SHA-256 of the cues analysed: tells the builder the captions changed since.</summary>
    public string CaptionFingerprint { get; set; } = string.Empty;
    public string RenderMode { get; set; } = string.Empty;
    public string Renderer { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>Render settings (jsonb), e.g. window size; empty object = defaults of the server.</summary>
    public string Settings { get; set; } = "{}";
    public short Progress { get; set; }
    /// <summary>Step of the render (QUEUED … SAVING, schema v3.13): kept after a failure, null once ready.</summary>
    public string? ProgressStage { get; set; }
    /// <summary>What the render is doing, in Vietnamese ("Chuẩn hóa ký hiệu 2/5: “bạn”").</summary>
    public string? ProgressDetail { get; set; }
    public int RenderAttempts { get; set; }
    public string? ErrorCode { get; set; }
    /// <summary>Vietnamese detail of the error (never a path, a key or a stack trace).</summary>
    public string? ErrorMessage { get; set; }
    public Guid? OutputAssetId { get; set; }
    /// <summary>SHA-256 of what was rendered (segments, signs, clips, mode): the output is current while it matches.</summary>
    public string? RenderedFingerprint { get; set; }
    public int? OutputDurationMs { get; set; }
    public int? OutputWidth { get; set; }
    public int? OutputHeight { get; set; }
    public DateTimeOffset? RenderStartedAt { get; set; }
    public DateTimeOffset? RenderedAt { get; set; }
    public Guid? PublishedOutputAssetId { get; set; }
    public string? PublishedRenderMode { get; set; }
    /// <summary>Settings and segments at publication (jsonb), restored by "Hủy bản nháp".</summary>
    public string? PublishedSnapshot { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? RequestedByUserId { get; set; }
}

/// <summary>
/// Table platform_sign_language_segments (schema v3.13): one caption sentence of a track and the signs that say it.
/// Sequence is a JSON array of items {sourceText, normalizedText, glossId, gloss, assetId, matchType, confidence,
/// isManualOverride, isMissing, skipped, durationMs, startMs, endMs, note, hint, candidateIds}.
/// </summary>
public class PlatformSignLanguageSegment : BaseEntity
{
    public Guid TrackId { get; set; }
    public int SegmentIndex { get; set; }
    public string CaptionText { get; set; } = string.Empty;
    public int StartMs { get; set; }
    public int EndMs { get; set; }
    public string Sequence { get; set; } = "[]";
    /// <summary>JSON array of the words still without a sign (kept for reporting).</summary>
    public string Missing { get; set; } = "[]";
    public decimal Confidence { get; set; }
    public string ReviewStatus { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
}
