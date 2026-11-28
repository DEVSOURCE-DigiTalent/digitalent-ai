namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>One line of the transcript: said from StartMs to EndMs (milliseconds from the start of the video).</summary>
public sealed class CaptionCueDto
{
    public int StartMs { get; set; }
    public int EndMs { get; set; }
    public string Text { get; set; } = string.Empty;
}

/// <summary>
/// The transcript of one lesson video for the course builder (step 1 of its sign-language video): the lines as saved
/// (`DraftCues`) and the state of the AI job. Not shown to learners.
/// </summary>
public sealed class PlatformAssetCaptionsDto
{
    public Guid AssetId { get; set; }
    public string Language { get; set; } = string.Empty;
    /// <summary>NONE (no captions yet) / PROCESSING (the AI is working) / READY / FAILED (the last AI run failed).</summary>
    public string Status { get; set; } = string.Empty;
    /// <summary>AI / MANUAL — who made the draft; null when there is none.</summary>
    public string? Source { get; set; }
    public string? Model { get; set; }
    public string? ErrorCode { get; set; }
    /// <summary>Vietnamese explanation of <see cref="ErrorCode"/>.</summary>
    public string? ErrorMessage { get; set; }
    public List<CaptionCueDto> DraftCues { get; set; } = new();
    /// <summary>Legacy: the copy once published to learners (captions are no longer shown); read only by sign-language tracks analysed from it.</summary>
    public List<CaptionCueDto>? PublishedCues { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    /// <summary>Legacy: the saved lines differ from <see cref="PublishedCues"/>.</summary>
    public bool HasUnpublishedChanges { get; set; }
    /// <summary>A Gemini key is set, so "Tạo lời thoại bằng AI" can run.</summary>
    public bool AiConfigured { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
