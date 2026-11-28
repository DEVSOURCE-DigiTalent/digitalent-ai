namespace DigiTalent.Domain.Constants;

/// <summary>
/// Sign-language dictionary for the 3D signing avatar (schema v3.12, table sign_glosses;
/// spec docs/specs/2026-11-24-sign-language-avatar.md). Must match the CHECK constraints.
/// </summary>
public static class SignLanguage
{
    /// <summary>sign_glosses.kind</summary>
    public static class Kind
    {
        public const string Word = "WORD";
        public const string Letter = "LETTER";
        public const string Digit = "DIGIT";
        public const string Tone = "TONE";

        public static readonly string[] All = { Word, Letter, Digit, Tone };

        public static bool IsValid(string? value) => value is Word or Letter or Digit or Tone;
    }

    public const int MaxGlossLength = 100;

    /// <summary>
    /// Where a sign is in its making (the dictionary's tabs, PA-18): no video yet → a video but no motion yet → a motion,
    /// waiting to be published. Published / archived signs are filtered by status.
    /// </summary>
    public static class Stage
    {
        public const string NoVideo = "NO_VIDEO";
        public const string NeedsMotion = "NEEDS_MOTION";
        public const string Ready = "READY";

        public static bool IsValid(string? value) => value is NoVideo or NeedsMotion or Ready;
    }

    /// <summary>
    /// sign_glosses.sign_language / platform_sign_language_tracks.sign_language (schema v3.13): VSL = ngôn ngữ ký hiệu
    /// Việt Nam. The column accepts any code of 2–10 capital letters so another sign language needs no migration.
    /// </summary>
    public static class Code
    {
        public const string Vsl = "VSL";

        public static bool IsValid(string? value) =>
            value is { Length: >= 2 and <= 10 } && value.All(c => c is >= 'A' and <= 'Z');
    }

    /// <summary>
    /// Region of a sign (schema v3.13): VN = cả nước / không rõ vùng; VN-BAC, VN-TRUNG, VN-NAM = một miền. Any
    /// "CC" or "CC-XXXX" code is accepted (ck_sign_glosses_region) so a new region needs no migration.
    /// </summary>
    public static class Region
    {
        public const string National = "VN";
        public const string North = "VN-BAC";
        public const string Central = "VN-TRUNG";
        public const string South = "VN-NAM";

        public static readonly string[] Known = { National, North, Central, South };

        public static bool IsValid(string? value)
        {
            if (value is not { Length: >= 2 and <= 13 }) return false;
            var parts = value.Split('-');
            return parts.Length <= 2
                   && parts[0].Length == 2 && parts[0].All(c => c is >= 'A' and <= 'Z')
                   && (parts.Length == 1 || (parts[1].Length is >= 2 and <= 10 && parts[1].All(c => c is >= 'A' and <= 'Z')));
        }
    }

    public const int MaxVariantLength = 50;
    public const int MaxSignerNameLength = 200;
    public const int MaxSynonyms = 20;

    /// <summary>
    /// Motion layout 1: per frame 325 little-endian int16 — [0] flags (bit 0 pose, bit 1 left hand, bit 2 right hand),
    /// 33 pose landmarks normalized to the image (x, y, z), 33 pose landmarks in metres, 21 left-hand and 21 right-hand
    /// landmarks in metres (hand world landmarks); value = round(float × 10000).
    /// </summary>
    public const short MotionLayoutV1 = 1;
    public const int ValuesPerFrameV1 = 1 + (33 + 33 + 21 + 21) * 3;
    public const int BytesPerFrameV1 = ValuesPerFrameV1 * 2;

    public const short MinFps = 5;
    public const short MaxFps = 60;
    public const int MaxFrames = 1800;

    /// <summary>Most signs fetched in one call (one lesson video rarely uses more).</summary>
    public const int MaxMotionsPerRequest = 300;
}
