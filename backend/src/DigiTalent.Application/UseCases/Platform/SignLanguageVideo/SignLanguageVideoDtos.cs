namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// One sign of a sentence as stored in platform_sign_language_segments.sequence (jsonb). GlossId null = no sign yet
/// (missing, or several variants tie — <see cref="MatchType"/> tells which).
/// </summary>
public sealed class SignSequenceItem
{
    public string SourceText { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;
    public Guid? GlossId { get; set; }
    public string? Gloss { get; set; }
    /// <summary>Video of the sign when it was chosen (matchedAssetId).</summary>
    public Guid? AssetId { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public bool IsManualOverride { get; set; }
    public bool IsMissing { get; set; }
    /// <summary>The admin chose not to sign this word.</summary>
    public bool Skipped { get; set; }
    /// <summary>Length the admin gave the sign (null = the clip's own length).</summary>
    public int? DurationMs { get; set; }
    /// <summary>Place on the video timeline: estimated after an analysis, measured after a render.</summary>
    public int? StartMs { get; set; }
    public int? EndMs { get; set; }
    public bool TimingMeasured { get; set; }
    public string? Note { get; set; }
    public string? Hint { get; set; }
    public List<Guid>? CandidateIds { get; set; }
}

/// <summary>The sign-language video of a lesson video, for the course builder.</summary>
public sealed class SignLanguageVideoDto
{
    public Guid AssetId { get; set; }
    public Guid? TrackId { get; set; }
    /// <summary>NONE (nothing made yet) or platform_sign_language_tracks.status.</summary>
    public string Status { get; set; } = "NONE";
    public SignVideoPrerequisitesDto Prerequisites { get; set; } = new();
    public SignVideoSettingsDto? Settings { get; set; }
    public short Progress { get; set; }
    /// <summary>Step of the render (QUEUED / DOWNLOADING / PREPARING_CLIPS / JOINING / COMPOSING / CHECKING / SAVING), kept after a failure.</summary>
    public string? ProgressStage { get; set; }
    /// <summary>What the render is doing, in Vietnamese.</summary>
    public string? ProgressDetail { get; set; }
    public DateTimeOffset? RenderStartedAt { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    /// <summary>A render still RENDERING long after it started (lost): it may be retried.</summary>
    public bool Stale { get; set; }
    /// <summary>The captions changed since the sign map was made: analyse again to follow them.</summary>
    public bool CaptionsChanged { get; set; }
    /// <summary>The draft changed since the last render (or a sign's video changed): the preview is not the current map.</summary>
    public bool OutputOutdated { get; set; }
    /// <summary>The draft differs from what learners see.</summary>
    public bool HasUnpublishedChanges { get; set; }
    public SignVideoSummaryDto Summary { get; set; } = new();
    public List<SignMissingWordDto> Missing { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<SignSegmentDto> Segments { get; set; } = new();
    public SignVideoOutputDto? Output { get; set; }
    public SignVideoOutputDto? Published { get; set; }
    /// <summary>Why "Tạo video ký hiệu" cannot run now (Vietnamese, first ones).</summary>
    public List<string> RenderBlockers { get; set; } = new();
    /// <summary>Why "Xuất bản video ký hiệu" cannot run now.</summary>
    public List<string> PublishBlockers { get; set; } = new();
    public DateTimeOffset? UpdatedAt { get; set; }
}

public sealed class SignVideoPrerequisitesDto
{
    public bool IsLessonVideo { get; set; }
    public bool HasCaptions { get; set; }
    public bool HasPublishedCaptions { get; set; }
    public bool HasDraftCaptions { get; set; }
    public bool CaptionsProcessing { get; set; }
    /// <summary>Signs in use of the sign language.</summary>
    public int DictionarySigns { get; set; }
    /// <summary>Signs with a video and recorded rights (usable by the clip renderer).</summary>
    public int UsableSigns { get; set; }
    /// <summary>Signs with a motion from a video whose rights are recorded (usable by the 3D avatar).</summary>
    public int UsableMotionSigns { get; set; }
    public bool RendererAvailable { get; set; }
    public string? RendererMessage { get; set; }
    public bool AvatarRendererAvailable { get; set; }
    public string? AvatarRendererMessage { get; set; }
}

/// <summary>
/// What the admin's browser needs to render the avatar track ("Tạo video ký hiệu" with the 3D avatar): the fingerprint to
/// send back, the frame grid of the lesson video, the tile, the sentences and the signs to perform.
/// </summary>
public sealed class SignAvatarJobDto
{
    public Guid TrackId { get; set; }
    public string Fingerprint { get; set; } = string.Empty;
    /// <summary>"30000/1001", "25" — sent back with the upload.</summary>
    public string FrameRate { get; set; } = string.Empty;
    public double Fps { get; set; }
    public int FrameCount { get; set; }
    public int DurationMs { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    /// <summary>"#RRGGBB" behind the avatar (opaque tracks only).</summary>
    public string Background { get; set; } = string.Empty;
    /// <summary>
    /// OVERLAY: no background — every frame is 2 × <see cref="Width"/> wide, colour premultiplied on black on the left
    /// half and the alpha as grey on the right half; the avatar is framed toward <see cref="Side"/>, cut at the hips by the
    /// bottom edge. Sent back with the upload.
    /// </summary>
    public bool Transparent { get; set; }
    /// <summary>"LEFT" / "RIGHT": the bottom corner the transparent avatar stands in.</summary>
    public string Side { get; set; } = "LEFT";
    public double MaxSpeedup { get; set; }
    public List<SignAvatarJobSegmentDto> Segments { get; set; } = new();
    /// <summary>Signs performed (their motions are read from /platform/sign-glosses/motions).</summary>
    public List<SignAvatarJobSignDto> Signs { get; set; } = new();
}

public sealed class SignAvatarJobSegmentDto
{
    public int Index { get; set; }
    public int StartMs { get; set; }
    public int EndMs { get; set; }
    /// <summary>Every word of the sentence in order, skipped ones included (they take speaking time).</summary>
    public List<SignAvatarJobItemDto> Items { get; set; } = new();
}

public sealed class SignAvatarJobItemDto
{
    public int ItemIndex { get; set; }
    public string SourceText { get; set; } = string.Empty;
    /// <summary>null = nothing to sign (skipped word, or skipped sentence).</summary>
    public Guid? GlossId { get; set; }
    /// <summary>Length the admin gave the sign (null = the motion's own length).</summary>
    public int? DurationMs { get; set; }
}

public sealed class SignAvatarJobSignDto
{
    public Guid GlossId { get; set; }
    public string Gloss { get; set; } = string.Empty;
    public bool Mirrored { get; set; }
}

public sealed class SignVideoSettingsDto
{
    public string CaptionSource { get; set; } = string.Empty;
    public string RenderMode { get; set; } = string.Empty;
    public string Renderer { get; set; } = string.Empty;
    public string SignLanguage { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string? Variant { get; set; }
}

public sealed class SignVideoSummaryDto
{
    public int Segments { get; set; }
    /// <summary>Sentences with words whose every sign can be rendered.</summary>
    public int ReadySegments { get; set; }
    public int SkippedSegments { get; set; }
    /// <summary>Sentences with only sounds that are not speech ([nhạc nền]): nothing to sign.</summary>
    public int NonSpeechSegments { get; set; }
    public int Items { get; set; }
    public int SignedItems { get; set; }
    public int MissingItems { get; set; }
    public int AmbiguousItems { get; set; }
    /// <summary>Signs found in the dictionary but without a usable video / motion / rights.</summary>
    public int UnavailableItems { get; set; }
    public int SkippedItems { get; set; }
    public int UnreviewedSegments { get; set; }
    public double Confidence { get; set; }
}

/// <summary>A word still without a sign, grouped over the sentences.</summary>
public sealed class SignMissingWordDto
{
    public string Text { get; set; } = string.Empty;
    public int Count { get; set; }
    /// <summary>Sentence numbers (1-based).</summary>
    public List<int> Segments { get; set; } = new();
    public string Reason { get; set; } = string.Empty;
    public string? Hint { get; set; }
}

public sealed class SignSegmentDto
{
    public int Index { get; set; }
    public int StartMs { get; set; }
    public int EndMs { get; set; }
    public string CaptionText { get; set; } = string.Empty;
    public string ReviewStatus { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public double Confidence { get; set; }
    /// <summary>Only sounds that are not speech ([nhạc nền]): nothing to sign.</summary>
    public bool NonSpeech { get; set; }
    public List<SignItemDto> Items { get; set; } = new();
    /// <summary>First problem blocking the render of this sentence.</summary>
    public string? Problem { get; set; }
}

public sealed class SignItemDto
{
    public string SourceText { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;
    public Guid? GlossId { get; set; }
    public string? Gloss { get; set; }
    public string? GlossKind { get; set; }
    public string? GlossStatus { get; set; }
    public string? Region { get; set; }
    public string? Variant { get; set; }
    public Guid? MatchedAssetId { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public bool IsManualOverride { get; set; }
    public bool IsMissing { get; set; }
    public bool Skipped { get; set; }
    public int? DurationMs { get; set; }
    public int? ClipDurationMs { get; set; }
    public int? StartMs { get; set; }
    public int? EndMs { get; set; }
    public bool TimingMeasured { get; set; }
    public string? Note { get; set; }
    public string? Hint { get; set; }
    /// <summary>OK / MISSING / AMBIGUOUS / NO_VIDEO / NO_MOTION / NO_LICENSE / ARCHIVED / SKIPPED.</summary>
    public string Availability { get; set; } = string.Empty;
    public string? Problem { get; set; }
    public List<SignCandidateDto> Candidates { get; set; } = new();
}

/// <summary>A sign of the dictionary offered for a word.</summary>
public sealed class SignCandidateDto
{
    public Guid Id { get; set; }
    public string Gloss { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public bool IsPreferred { get; set; }
    public short Priority { get; set; }
    public bool HasVideo { get; set; }
    public bool HasMotion { get; set; }
    public bool Licensed { get; set; }
}

public sealed class SignVideoOutputDto
{
    public Guid AssetId { get; set; }
    /// <summary>Signed content link (relative to the API root), like every platform asset.</summary>
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int? DurationMs { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string RenderMode { get; set; } = string.Empty;
    public DateTimeOffset? At { get; set; }
}

/// <summary>Light state of a render, for polling.</summary>
public sealed class SignVideoStatusDto
{
    public Guid TrackId { get; set; }
    public string Status { get; set; } = string.Empty;
    public short Progress { get; set; }
    public string? ProgressStage { get; set; }
    public string? ProgressDetail { get; set; }
    public DateTimeOffset? RenderStartedAt { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public bool Stale { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>The sign of the dictionary for a text (map editor: joined words, edited text).</summary>
public sealed class SignMatchDto
{
    public string Text { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;
    public Guid? GlossId { get; set; }
    public string? Gloss { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string? Hint { get; set; }
    public List<SignCandidateDto> Candidates { get; set; } = new();
}

/// <summary>The published sign-language video of a lesson video, for learners (LessonMediaDto.SignLanguage).</summary>
public sealed class LessonSignVideoDto
{
    public string Url { get; set; } = string.Empty;
    /// <summary>OVERLAY / FULLSCREEN: a full lesson video with the signer (swap the source); TRACK_ONLY: show it over the lesson video, in sync.</summary>
    public string Mode { get; set; } = string.Empty;
    public string SignLanguage { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
}
