namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class GetPlatformAssetContentUseCaseOutput
{
    public Stream Content { get; set; } = Stream.Null;
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
