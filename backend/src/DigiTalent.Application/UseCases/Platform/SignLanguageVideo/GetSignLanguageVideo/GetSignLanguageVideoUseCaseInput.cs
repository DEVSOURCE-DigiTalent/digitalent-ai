namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class GetSignLanguageVideoUseCaseInput
{
    public Guid AssetId { get; set; }
    /// <summary>Empty = VSL.</summary>
    public string? SignLanguage { get; set; }
}
