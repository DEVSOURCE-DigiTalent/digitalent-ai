using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table sign_glosses (schema v3.12): one sign of the sign-language dictionary — a word, a fingerspelled letter, a digit
/// or a tone mark — with the video of a person signing it and the motion taken from that video for the 3D avatar.
/// MotionData holds MediaPipe Holistic landmarks per frame as int16 (layout in <see cref="Constants.SignLanguage"/>),
/// not joint angles, so the avatar or the solver can change without scanning the videos again.
/// </summary>
public class SignGloss : BaseEntity
{
    public string Gloss { get; set; } = string.Empty;
    public string Normalized { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? VideoAssetId { get; set; }
    public string? SourceName { get; set; }
    public string? SourceUrl { get; set; }
    public string? LicenseNote { get; set; }
    public byte[]? MotionData { get; set; }
    public short? MotionLayout { get; set; }
    public short? MotionFps { get; set; }
    public int? MotionFrames { get; set; }
    public int? MotionStartMs { get; set; }
    public int? MotionEndMs { get; set; }
    /// <summary>Swap left and right hands when playing (a mirrored source video).</summary>
    public bool Mirrored { get; set; }

    // ----- Schema v3.13: variants and rights (sign-language video) -----
    /// <summary>VSL = ngôn ngữ ký hiệu Việt Nam.</summary>
    public string SignLanguage { get; set; } = Constants.SignLanguage.Code.Vsl;
    /// <summary>VN (cả nước) or a region such as VN-BAC.</summary>
    public string Region { get; set; } = Constants.SignLanguage.Region.National;
    /// <summary>Optional name of the variant (another signer, another context, another dictionary edition).</summary>
    public string? Variant { get; set; }
    /// <summary>The default sign when the word has several variants (one per word × kind × sign language).</summary>
    public bool IsPreferred { get; set; }
    /// <summary>Higher wins between variants that are not the default.</summary>
    public short Priority { get; set; }
    /// <summary>JSON array of other words or phrases this sign says (normalized), e.g. ["xin chào", "chào"].</summary>
    public string Synonyms { get; set; } = "[]";
    /// <summary>The owner of the video and the signer allowed its use in DigiTalent.</summary>
    public bool ConsentConfirmed { get; set; }
    public string? SignerName { get; set; }
    /// <summary>Measured length of the video (set by the sign-video renderer; cleared when the video changes).</summary>
    public int? VideoDurationMs { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public Guid? PublishedByUserId { get; set; }
}
