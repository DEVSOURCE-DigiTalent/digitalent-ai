namespace DigiTalent.Domain.Constants;

/// <summary>
/// Sign-language video of a lesson video (schema v3.13, tables platform_sign_language_tracks and
/// platform_sign_language_segments; spec docs/specs/2026-11-24-sign-language-video.md). Must match the CHECK constraints.
/// Status values live in <see cref="Statuses.SignLanguageTrack"/>.
/// </summary>
public static class SignVideo
{
    /// <summary>platform_sign_language_tracks.render_mode — how the signing is shown to learners.</summary>
    public static class RenderMode
    {
        /// <summary>The lesson video with the signer in a window at the bottom right (one video file).</summary>
        public const string Overlay = "OVERLAY";
        /// <summary>The signer alone, full frame, with the lesson audio.</summary>
        public const string Fullscreen = "FULLSCREEN";
        /// <summary>Only the signer track (no audio); the learner player shows it over the lesson video, in sync.</summary>
        public const string TrackOnly = "TRACK_ONLY";

        public static readonly string[] All = { Overlay, Fullscreen, TrackOnly };

        public static bool IsValid(string? value) => value is Overlay or Fullscreen or TrackOnly;
    }

    /// <summary>platform_sign_language_tracks.renderer — what makes the video.</summary>
    public static class Renderer
    {
        /// <summary>
        /// Clips of real people signing, taken from the dictionary and joined on the caption timeline (FFmpeg). One video
        /// shows one person only: every sign used must have the same signer (<see cref="Errors.SignerMixed"/>).
        /// </summary>
        public const string Clip = "CLIP";
        /// <summary>
        /// The 3D avatar (one character from start to end) driven by the motions of the dictionary: the admin's browser
        /// renders the avatar track frame by frame at the lesson video's frame rate, the server composes it (default).
        /// </summary>
        public const string Avatar = "AVATAR";

        public static bool IsValid(string? value) => value is Clip or Avatar;
    }

    /// <summary>platform_sign_language_tracks.caption_source — which copy of the captions was analysed.</summary>
    public static class CaptionSource
    {
        public const string Published = "PUBLISHED";
        public const string Draft = "DRAFT";

        public static bool IsValid(string? value) => value is Published or Draft;
    }

    /// <summary>
    /// platform_sign_language_tracks.progress_stage — the step a render is at (shown step by step in the builder).
    /// Kept after a failure so the builder can say where it failed; cleared once the video is ready.
    /// </summary>
    public static class Stage
    {
        /// <summary>Waiting for the background worker.</summary>
        public const string Queued = "QUEUED";
        /// <summary>Reading the lesson video from storage.</summary>
        public const string Downloading = "DOWNLOADING";
        /// <summary>Cutting, muting and resizing each sign clip.</summary>
        public const string PreparingClips = "PREPARING_CLIPS";
        /// <summary>Placing the signs on the caption timeline and joining them.</summary>
        public const string Joining = "JOINING";
        /// <summary>Making the output video (window, full screen or track).</summary>
        public const string Composing = "COMPOSING";
        /// <summary>Checking the output can be read.</summary>
        public const string Checking = "CHECKING";
        /// <summary>Storing the output as a platform asset.</summary>
        public const string Saving = "SAVING";

        public static readonly string[] All = { Queued, Downloading, PreparingClips, Joining, Composing, Checking, Saving };

        public static bool IsValid(string? value) => value != null && All.Contains(value);
    }

    /// <summary>platform_sign_language_segments.review_status</summary>
    public static class Review
    {
        public const string Pending = "PENDING";
        /// <summary>A person who knows sign language checked the signs of the sentence.</summary>
        public const string Approved = "APPROVED";
        /// <summary>The admin chose not to sign this sentence (the signer rests during it).</summary>
        public const string Skipped = "SKIPPED";

        public static bool IsValid(string? value) => value is Pending or Approved or Skipped;
    }

    /// <summary>How a piece of the caption was matched to a sign (sequence item matchType).</summary>
    public static class Match
    {
        /// <summary>The whole sentence is one sign of the dictionary.</summary>
        public const string ExactSentence = "EXACT_SENTENCE";
        /// <summary>Several words matched one sign (longest phrase first).</summary>
        public const string Phrase = "PHRASE";
        public const string Word = "WORD";
        /// <summary>Matched without Vietnamese accents (a sign typed without accents, or a caption without them).</summary>
        public const string Unaccented = "UNACCENTED";
        /// <summary>Matched through a synonym declared on the sign.</summary>
        public const string Synonym = "SYNONYM";
        /// <summary>Matched after a simple singular/plural fold (foreign words: "emails" → "email").</summary>
        public const string Normalized = "NORMALIZED";
        /// <summary>A number signed digit by digit.</summary>
        public const string Digits = "DIGITS";
        /// <summary>Chosen by the admin.</summary>
        public const string Manual = "MANUAL";
        /// <summary>Several signs fit equally (region, variant, default and priority tie): the admin must choose.</summary>
        public const string Ambiguous = "AMBIGUOUS";
        public const string Missing = "MISSING";
    }

    /// <summary>Machine codes of the sign-video errors (API errors[].message and platform_sign_language_tracks.error_code).</summary>
    public static class Errors
    {
        public const string CaptionNotFound = "SIGN_CAPTION_NOT_FOUND";
        public const string CaptionNotPublished = "SIGN_CAPTION_NOT_PUBLISHED";
        public const string GlossNotFound = "SIGN_GLOSS_NOT_FOUND";
        public const string MediaMissing = "SIGN_MEDIA_MISSING";
        public const string MotionMissing = "SIGN_MOTION_MISSING";
        public const string LicenseMissing = "SIGN_LICENSE_MISSING";
        public const string RendererNotConfigured = "SIGN_RENDERER_NOT_CONFIGURED";
        public const string VideoUnreadable = "SIGN_VIDEO_UNREADABLE";
        public const string RenderFailed = "SIGN_RENDER_FAILED";
        public const string StorageUploadFailed = "SIGN_STORAGE_UPLOAD_FAILED";
        public const string OutputInvalid = "SIGN_OUTPUT_INVALID";
        public const string NotRendered = "SIGN_NOT_RENDERED";
        public const string ReviewPending = "SIGN_REVIEW_PENDING";
        public const string JobAlreadyRunning = "SIGN_JOB_ALREADY_RUNNING";
        public const string JobTimeout = "SIGN_JOB_TIMEOUT";
        public const string PermissionDenied = "SIGN_PERMISSION_DENIED";
        public const string NotALessonVideo = "SIGN_NOT_A_LESSON_VIDEO";
        public const string InvalidSegments = "SIGN_INVALID_SEGMENTS";
        /// <summary>CLIP: the signs come from several signers (or a signer is not recorded) — a video shows one character only.</summary>
        public const string SignerMixed = "SIGN_SIGNER_MIXED";
        /// <summary>AVATAR: the avatar track has not been rendered in the browser and uploaded yet (or it was used).</summary>
        public const string AvatarTrackMissing = "SIGN_AVATAR_TRACK_MISSING";
        /// <summary>AVATAR: the avatar track was rendered from an older sign map or settings.</summary>
        public const string AvatarTrackOutdated = "SIGN_AVATAR_TRACK_OUTDATED";
        /// <summary>AVATAR: the uploaded avatar track is not what was asked (format, frame rate, frame count, size).</summary>
        public const string AvatarTrackInvalid = "SIGN_AVATAR_TRACK_INVALID";
        /// <summary>The avatar endpoints were called for a track that uses dictionary clips (CLIP).</summary>
        public const string NotAvatar = "SIGN_NOT_AVATAR";
    }

    /// <summary>
    /// The avatar track rendered by the admin's browser (WebCodecs) and uploaded for composition: raw H.264 (Annex B)
    /// or VP8/VP9 in IVF, exactly one frame per frame of the lesson video, no sound.
    /// </summary>
    public static class AvatarTrack
    {
        /// <summary>Raw H.264 elementary stream (Annex B), constant frame rate given with the upload.</summary>
        public const string H264 = "H264";
        /// <summary>VP8 or VP9 frames in an IVF file (the frame rate is in its header).</summary>
        public const string Ivf = "IVF";

        public static bool IsValidFormat(string? value) => value is H264 or Ivf;

        /// <summary>
        /// OVERLAY: the avatar is laid over the lesson picture without any background, so its track carries the
        /// transparency — H.264 has no alpha channel, so each frame is twice as wide: the colour (premultiplied on black)
        /// on the left half, the alpha as grey (white = avatar) on the right half. FULLSCREEN / TRACK_ONLY stay opaque.
        /// </summary>
        public static bool IsTransparent(string? renderMode) => renderMode == RenderMode.Overlay;

        /// <summary>Largest avatar track accepted (same as an uploaded video).</summary>
        public const long MaxBytes = PlatformCatalog.AssetKind.MaxVideoBytes;
        /// <summary>Frames the track may differ from the lesson video (rounding of the last frame).</summary>
        public const int FrameTolerance = 2;
    }

    /// <summary>Most signs in one sentence.</summary>
    public const int MaxItemsPerSegment = 60;
    /// <summary>Longest phrase looked up in the dictionary, in words.</summary>
    public const int MaxPhraseWords = 8;
    public const int MaxSourceTextLength = 200;
    public const int MaxNoteLength = 500;
    /// <summary>Length the admin may give one sign.</summary>
    public const int MinItemDurationMs = 200;
    public const int MaxItemDurationMs = 20_000;
    /// <summary>Length assumed for a sign whose clip was never measured (shown as an estimate).</summary>
    public const int EstimatedSignMs = 1000;
    /// <summary>A sign may be played at most this much faster to keep up with the speech.</summary>
    public const double MaxSpeedup = 1.5;
    /// <summary>The signing of the last sentence may go on this long after its caption ends.</summary>
    public const int LastSentenceTailMs = 3000;
    /// <summary>Largest output stored as a platform asset (same as an uploaded video, ck_platform_assets_size).</summary>
    public const long MaxOutputBytes = PlatformCatalog.AssetKind.MaxVideoBytes;
    /// <summary>A render still RENDERING after this was lost (server stopped, worker crashed) and may be retried.</summary>
    public static readonly TimeSpan StaleAfter = TimeSpan.FromHours(3);
}
