namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class SaveSignLanguageSegmentsUseCaseInput
{
    public Guid TrackId { get; set; }
    /// <summary>Only the sentences that changed.</summary>
    public List<SignSegmentInput> Segments { get; set; } = new();
}

public class SignSegmentInput
{
    public int Index { get; set; }
    /// <summary>The signs of the sentence in signing order; null = keep them.</summary>
    public List<SignItemInput>? Items { get; set; }
    /// <summary>PENDING / APPROVED / SKIPPED; null = keep (reset to PENDING when the signs change).</summary>
    public string? ReviewStatus { get; set; }
    /// <summary>null = keep; empty = clear.</summary>
    public string? ReviewNote { get; set; }
}

public class SignItemInput
{
    /// <summary>The words this sign says (joined or split by the admin).</summary>
    public string SourceText { get; set; } = string.Empty;
    /// <summary>The sign chosen; null = look it up in the dictionary.</summary>
    public Guid? GlossId { get; set; }
    public bool Skipped { get; set; }
    public int? DurationMs { get; set; }
    public string? Note { get; set; }
}
