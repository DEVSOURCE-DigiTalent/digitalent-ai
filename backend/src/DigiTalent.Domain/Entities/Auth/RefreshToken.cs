using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng refresh_tokens. Hiện chưa dùng tới (đăng nhập mới chỉ cấp access token).
/// </summary>
public class RefreshToken : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public Guid? ReplacedByTokenId { get; set; }
    public string? IpHash { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
