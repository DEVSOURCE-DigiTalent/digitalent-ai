using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Certificate;

public class CertificateTemplate : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TemplateHtml { get; set; } = string.Empty;
    public Guid? BackgroundFileObjectId { get; set; }
    public string Status { get; set; } = "DRAFT";
    public Guid? CreatedByUserId { get; set; }
}

public class Certificate : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Organization.Employee Employee { get; set; } = null!;
    public Guid CourseId { get; set; }
    public Learning.Course Course { get; set; } = null!;
    public Guid? AssessmentAttemptId { get; set; }
    public Guid CertificateTemplateId { get; set; }
    public CertificateTemplate CertificateTemplate { get; set; } = null!;
    public string CertificateCode { get; set; } = string.Empty;
    public string QrUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "VALID";
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
    public Guid? PdfFileObjectId { get; set; }
}

public class CertificateVerificationLog : AuditableEntity
{
    public Guid? CertificateId { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public DateTimeOffset VerifiedAt { get; set; }
    public string ResultStatus { get; set; } = string.Empty;
    public string? VerifierIp { get; set; }
    public string? UserAgent { get; set; }
}
