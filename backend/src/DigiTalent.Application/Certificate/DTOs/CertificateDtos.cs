namespace DigiTalent.Application.Certificate.DTOs;

// ═══════════════════════════════════════════════
// Certificate Templates
// ═══════════════════════════════════════════════

public class CreateCertificateTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public string TemplateHtml { get; set; } = string.Empty;
    public Guid? BackgroundFileObjectId { get; set; }
}

public class UpdateCertificateTemplateRequest
{
    public string? Name { get; set; }
    public string? TemplateHtml { get; set; }
    public string? Status { get; set; }
    public Guid? BackgroundFileObjectId { get; set; }
}

public class CertificateTemplateResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class CertificateTemplateDetailResponse : CertificateTemplateResponse
{
    public string TemplateHtml { get; set; } = string.Empty;
    public Guid? BackgroundFileObjectId { get; set; }
}

// ═══════════════════════════════════════════════
// Certificates
// ═══════════════════════════════════════════════

public class IssueCertificateRequest
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public Guid? AssessmentAttemptId { get; set; }
    public Guid CertificateTemplateId { get; set; }
}

public class CertificateResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CertificateCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
}

public class CertificateDetailResponse : CertificateResponse
{
    public string QrUrl { get; set; } = string.Empty;
    public Guid? AssessmentAttemptId { get; set; }
    public Guid? PdfFileObjectId { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
}

// ═══════════════════════════════════════════════
// Certificate Verification
// ═══════════════════════════════════════════════

public class VerifyCertificateRequest
{
    public string CertificateCode { get; set; } = string.Empty;
}

public class CertificateVerificationResponse
{
    public bool IsValid { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string? Message { get; set; }
}

public class RevokeCertificateRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class MyCertificateResponse
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
}

public class RenewCertificateRequest
{
    public Guid? AssessmentAttemptId { get; set; }
    public DateTimeOffset? NewExpiryDate { get; set; }
}
