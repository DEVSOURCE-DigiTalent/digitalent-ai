using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class AnalyzeSignLanguageVideoUseCaseInput
{
    public Guid AssetId { get; set; }
    /// <summary>PUBLISHED (default) / DRAFT copy of the captions.</summary>
    /// <summary>DRAFT = the transcript last saved (the builder always sends it); PUBLISHED is kept for tracks analysed before.</summary>
    public string CaptionSource { get; set; } = SignVideo.CaptionSource.Draft;
    /// <summary>OVERLAY (default: the signer in a window at the bottom left) / FULLSCREEN / TRACK_ONLY.</summary>
    public string RenderMode { get; set; } = SignVideo.RenderMode.Overlay;
    /// <summary>AVATAR (default: one 3D character for the whole video) / CLIP (dictionary clips of one real person).</summary>
    public string Renderer { get; set; } = SignVideo.Renderer.Avatar;
    public string SignLanguage { get; set; } = Domain.Constants.SignLanguage.Code.Vsl;
    /// <summary>Preferred region when a word has several signs.</summary>
    public string Region { get; set; } = Domain.Constants.SignLanguage.Region.National;
    public string? Variant { get; set; }
}
