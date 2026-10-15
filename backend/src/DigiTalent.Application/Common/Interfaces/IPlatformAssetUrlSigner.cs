namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Time-limited links to platform course media. An &lt;img&gt; or &lt;video&gt; cannot send the bearer token, so the
/// content endpoint is reached with a signed link instead of a permission check.
/// </summary>
public interface IPlatformAssetUrlSigner
{
    /// <summary>Path relative to the API root (api/v1/), e.g. "platform/assets/{id}/content?exp=…&amp;sig=…".</summary>
    string ContentPath(Guid assetId);

    bool IsValid(Guid assetId, long expiresAtUnixSeconds, string? signature);
}
