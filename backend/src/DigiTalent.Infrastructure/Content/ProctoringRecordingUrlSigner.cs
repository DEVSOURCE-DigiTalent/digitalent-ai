using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;

namespace DigiTalent.Infrastructure.Content;

/// <summary>
/// Link HMAC-SHA256 tới tệp ghi hình bài làm có giám sát, khóa dẫn xuất từ khóa ký JWT với tiền tố mục đích riêng
/// (không lẫn với chữ ký token hay link học liệu nền tảng). Link có hạn 6 giờ, làm tròn theo giờ để trình duyệt dùng lại.
/// </summary>
public sealed class ProctoringRecordingUrlSigner : IProctoringRecordingUrlSigner
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(6);

    private readonly byte[] _key;
    private readonly TimeProvider _clock;

    public ProctoringRecordingUrlSigner(JwtSettings jwt, TimeProvider clock)
    {
        _key = SHA256.HashData(Encoding.UTF8.GetBytes("proctoring-recordings:" + jwt.SigningKey));
        _clock = clock;
    }

    public string ContentPath(Guid recordingId)
    {
        var now = _clock.GetUtcNow();
        var expires = new DateTimeOffset(now.Year, now.Month, now.Day, now.Hour, 0, 0, TimeSpan.Zero).Add(Lifetime).ToUnixTimeSeconds();
        return $"pulse/recordings/{recordingId}/content?exp={expires}&sig={Sign(recordingId, expires)}";
    }

    public bool IsValid(Guid recordingId, long expiresAtUnixSeconds, string? signature)
    {
        if (string.IsNullOrEmpty(signature) || expiresAtUnixSeconds < _clock.GetUtcNow().ToUnixTimeSeconds())
        {
            return false;
        }

        var expected = Encoding.ASCII.GetBytes(Sign(recordingId, expiresAtUnixSeconds));
        return CryptographicOperations.FixedTimeEquals(expected, Encoding.ASCII.GetBytes(signature));
    }

    private string Sign(Guid recordingId, long expires)
    {
        var mac = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes($"{recordingId:N}.{expires}"));
        return Convert.ToHexString(mac).ToLowerInvariant();
    }
}
