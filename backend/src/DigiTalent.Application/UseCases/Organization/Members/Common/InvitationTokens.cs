using System.Security.Cryptography;
using System.Text;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Activation tokens of member invitations: 32 random bytes (base64url) sent to the invitee; only the SHA-256 hash
/// is stored (member_invitations.token_hash), so a database leak does not expose usable links.
/// </summary>
public static class InvitationTokens
{
    /// <summary>How long an invitation link stays valid. Resending issues a new token and restarts the period.</summary>
    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(7);

    public static string NewToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token.Trim()))).ToLowerInvariant();
}
