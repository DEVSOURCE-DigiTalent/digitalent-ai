using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;

namespace DigiTalent.Infrastructure.Content;

/// <summary>
/// HMAC-SHA256 links for platform media, keyed from the JWT signing key with a purpose prefix so a media
/// signature can never be confused with a token signature. Links stay valid for 12 hours.
/// </summary>
public sealed class PlatformAssetUrlSigner : IPlatformAssetUrlSigner
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(12);

    private readonly byte[] _key;
    private readonly TimeProvider _clock;

    public PlatformAssetUrlSigner(JwtSettings jwt, TimeProvider clock)
    {
        _key = SHA256.HashData(Encoding.UTF8.GetBytes("platform-assets:" + jwt.SigningKey));
        _clock = clock;
    }

    public string ContentPath(Guid assetId)
    {
        // Rounded to the hour so the same link is reused (and cached by the browser) within that hour.
        var now = _clock.GetUtcNow();
        var expires = new DateTimeOffset(now.Year, now.Month, now.Day, now.Hour, 0, 0, TimeSpan.Zero).Add(Lifetime).ToUnixTimeSeconds();
        return $"platform/assets/{assetId}/content?exp={expires}&sig={Sign(assetId, expires)}";
    }

    public bool IsValid(Guid assetId, long expiresAtUnixSeconds, string? signature)
    {
        if (string.IsNullOrEmpty(signature) || expiresAtUnixSeconds < _clock.GetUtcNow().ToUnixTimeSeconds())
        {
            return false;
        }

        var expected = Encoding.ASCII.GetBytes(Sign(assetId, expiresAtUnixSeconds));
        return CryptographicOperations.FixedTimeEquals(expected, Encoding.ASCII.GetBytes(signature));
    }

    private string Sign(Guid assetId, long expires)
    {
        var mac = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes($"{assetId:N}.{expires}"));
        return Convert.ToHexString(mac).ToLowerInvariant();
    }
}
