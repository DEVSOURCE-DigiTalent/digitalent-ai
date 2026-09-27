using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng certificate_verification_logs. Lịch sử quét mã kiểm tra chứng chỉ.
/// </summary>
public class CertificateVerificationLog : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CertificateId { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string ResultStatus { get; set; } = string.Empty;
    public string? IpHash { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset VerifiedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
