namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class GetSignGlossesUseCaseInput
{
    public string? Search { get; set; }
    /// <summary>WORD / LETTER / DIGIT / TONE; empty = every kind.</summary>
    public string? Kind { get; set; }
    /// <summary>DRAFT / PUBLISHED / ARCHIVED; empty = every sign in use (not ARCHIVED).</summary>
    public string? Status { get; set; }
    /// <summary>Only signs without motion yet (to extract).</summary>
    public bool? WithoutMotion { get; set; }
    /// <summary>NO_VIDEO / NEEDS_MOTION (a video, no motion) / READY (a motion, still a draft); empty = any.</summary>
    public string? Stage { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
