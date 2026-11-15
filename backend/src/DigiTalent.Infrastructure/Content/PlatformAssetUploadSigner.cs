using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;

namespace DigiTalent.Infrastructure.Content;

/// <summary>
/// HMAC-SHA256 upload ticket signer keyed from JWT signing key with a distinct purpose prefix.
/// </summary>
public sealed class PlatformAssetUploadSigner : IPlatformAssetUploadSigner
{
    private readonly byte[] _key;
    private readonly TimeProvider _clock;

    public PlatformAssetUploadSigner(JwtSettings jwt, TimeProvider clock)
    {
        _key = SHA256.HashData(Encoding.UTF8.GetBytes("platform-asset-upload:" + jwt.SigningKey));
        _clock = clock;
    }

    public string Sign(PlatformAssetUploadTicketPayload payload)
    {
        var json = JsonSerializer.SerializeToUtf8Bytes(payload);
        var encoded = Base64UrlEncode(json);
        var mac = SignEncoded(encoded);
        return $"{encoded}.{mac}";
    }

    public bool TryVerify(string ticket, out PlatformAssetUploadTicketPayload? payload)
    {
        payload = null;
        if (string.IsNullOrWhiteSpace(ticket))
        {
            return false;
        }

        var dot = ticket.IndexOf('.');
        if (dot <= 0 || dot >= ticket.Length - 1)
        {
            return false;
        }

        var encoded = ticket[..dot];
        var sig = ticket[(dot + 1)..];
        var expected = Encoding.ASCII.GetBytes(SignEncoded(encoded));
        var actual = Encoding.ASCII.GetBytes(sig);
        if (expected.Length != actual.Length || !CryptographicOperations.FixedTimeEquals(expected, actual))
        {
            return false;
        }

        try
        {
            var bytes = Base64UrlDecode(encoded);
            var parsed = JsonSerializer.Deserialize<PlatformAssetUploadTicketPayload>(bytes);
            if (parsed == null || parsed.ExpiresAtUnixSeconds < _clock.GetUtcNow().ToUnixTimeSeconds())
            {
                return false;
            }

            payload = parsed;
            return true;
        }
        catch
        {
            return false;
        }
    }

    private string SignEncoded(string encodedPayload)
    {
        var mac = HMACSHA256.HashData(_key, Encoding.ASCII.GetBytes(encodedPayload));
        return Convert.ToHexString(mac).ToLowerInvariant();
    }

    private static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        var mod = padded.Length % 4;
        if (mod > 0)
        {
            padded += new string('=', 4 - mod);
        }

        return Convert.FromBase64String(padded);
    }
}
