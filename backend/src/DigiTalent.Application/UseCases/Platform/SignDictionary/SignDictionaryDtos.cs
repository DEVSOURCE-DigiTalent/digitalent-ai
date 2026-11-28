using DigiTalent.Application.UseCases.Platform.Catalog;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>A sign of the dictionary as the Platform Admin sees it (no motion bytes; see <see cref="SignGlossMotionDto"/>).</summary>
public sealed class SignGlossDto
{
    public Guid Id { get; set; }
    public string Gloss { get; set; } = string.Empty;
    /// <summary>WORD / LETTER / DIGIT / TONE.</summary>
    public string Kind { get; set; } = string.Empty;
    /// <summary>DRAFT / PUBLISHED / ARCHIVED.</summary>
    public string Status { get; set; } = string.Empty;
    public PlatformAssetDto? Video { get; set; }
    public string? SourceName { get; set; }
    public string? SourceUrl { get; set; }
    public string? LicenseNote { get; set; }
    public bool HasMotion { get; set; }
    public short? MotionFps { get; set; }
    public int? MotionFrames { get; set; }
    public int? DurationMs { get; set; }
    public int? MotionStartMs { get; set; }
    public int? MotionEndMs { get; set; }
    public bool Mirrored { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    // ----- Schema v3.13 -----
    public string SignLanguage { get; set; } = string.Empty;
    /// <summary>VN = cả nước; VN-BAC / VN-TRUNG / VN-NAM…</summary>
    public string Region { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public bool IsPreferred { get; set; }
    public short Priority { get; set; }
    public List<string> Synonyms { get; set; } = new();
    public bool ConsentConfirmed { get; set; }
    public string? SignerName { get; set; }
    public int? VideoDurationMs { get; set; }
    /// <summary>Has a video with its source, licence and consent: the sign-language video may use it.</summary>
    public bool UsableForVideo { get; set; }
}

/// <summary>The motion of a sign for the avatar: landmarks per frame, int16 little-endian (Data is base64 in JSON).</summary>
public sealed class SignGlossMotionDto
{
    public Guid Id { get; set; }
    public string Gloss { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public short Layout { get; set; }
    public short Fps { get; set; }
    public int Frames { get; set; }
    public bool Mirrored { get; set; }
    public byte[] Data { get; set; } = Array.Empty<byte>();
}

/// <summary>How many signs are at each step of their making (PA-18 tabs).</summary>
public sealed class SignGlossSummaryDto
{
    /// <summary>Signs in use (draft and published).</summary>
    public int Total { get; set; }
    /// <summary>In use, no video yet.</summary>
    public int NoVideo { get; set; }
    /// <summary>In use, a video but no motion yet.</summary>
    public int NeedsMotion { get; set; }
    /// <summary>Drafts with a motion: to check on the avatar and publish.</summary>
    public int Ready { get; set; }
    public int Published { get; set; }
    public int Archived { get; set; }
}
