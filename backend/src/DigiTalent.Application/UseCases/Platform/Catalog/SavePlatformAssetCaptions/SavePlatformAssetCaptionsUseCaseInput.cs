namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class SavePlatformAssetCaptionsUseCaseInput
{
    public Guid AssetId { get; set; }
    /// <summary>The whole draft, in time order.</summary>
    public List<CaptionCueDto>? Cues { get; set; }
}
