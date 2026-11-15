namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class PresignPlatformAssetUseCaseOutput
{
    public string Mode { get; set; } = "PROXY";
    public string? UploadUrl { get; set; }
    public string? UploadToken { get; set; }
    public string? Method { get; set; }
    public long ExpiresAtUnixSeconds { get; set; }
}
