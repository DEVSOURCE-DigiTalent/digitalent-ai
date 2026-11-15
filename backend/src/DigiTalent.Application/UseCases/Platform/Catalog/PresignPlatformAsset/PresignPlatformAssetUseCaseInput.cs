namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class PresignPlatformAssetUseCaseInput
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}
