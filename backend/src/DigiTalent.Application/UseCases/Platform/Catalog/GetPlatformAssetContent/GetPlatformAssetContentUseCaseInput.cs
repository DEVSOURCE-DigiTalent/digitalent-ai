namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class GetPlatformAssetContentUseCaseInput
{
    public Guid AssetId { get; set; }
    /// <summary>Unix seconds of the link's expiry (query "exp").</summary>
    public long ExpiresAt { get; set; }
    /// <summary>Query "sig".</summary>
    public string? Signature { get; set; }
}
