using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng certificates. Chứng chỉ đã cấp.
/// </summary>
public class Certificate : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Guid EnrollmentId { get; set; }
    public Guid AssessmentAttemptId { get; set; }
    public Guid CertificateTemplateId { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string HolderNameSnapshot { get; set; } = string.Empty;
    public string CourseTitleSnapshot { get; set; } = string.Empty;
    public string? PrimaryCompetencySnapshot { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? PdfFileObjectId { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public Guid? RevokedByUserId { get; set; }
    public string? RevocationReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
