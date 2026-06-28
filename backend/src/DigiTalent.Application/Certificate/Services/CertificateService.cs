using DigiTalent.Application.Certificate.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Certificate.Services;

public class CertificateService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;
    private readonly INotificationHubService _notificationHub;

    public CertificateService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        AuditLogService auditLog,
        INotificationHubService notificationHub)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
        _notificationHub = notificationHub;
    }

    // ═══════════════════════════════════════
    // Certificate Templates
    // ═══════════════════════════════════════

    public async Task<PagedList<CertificateTemplateResponse>> SearchTemplatesAsync(PaginationRequest request)
    {
        var query = _context.CertificateTemplates.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new CertificateTemplateResponse
            {
                Id = t.Id,
                Name = t.Name,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<CertificateTemplateResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<List<CertificateTemplateResponse>> GetAllTemplatesAsync()
    {
        return await _context.CertificateTemplates
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new CertificateTemplateResponse
            {
                Id = t.Id,
                Name = t.Name,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<CertificateTemplateDetailResponse> GetTemplateAsync(Guid templateId)
    {
        var template = await _context.CertificateTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId)
            ?? throw new KeyNotFoundException("Certificate template not found.");

        return new CertificateTemplateDetailResponse
        {
            Id = template.Id,
            Name = template.Name,
            TemplateHtml = template.TemplateHtml,
            BackgroundFileObjectId = template.BackgroundFileObjectId,
            Status = template.Status,
            CreatedAt = template.CreatedAt,
        };
    }

    public async Task<CertificateTemplateResponse> CreateTemplateAsync(CreateCertificateTemplateRequest request)
    {
        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Certificate.CertificateTemplate
        {
            OrganizationId = orgId,
            Name = request.Name,
            TemplateHtml = request.TemplateHtml,
            BackgroundFileObjectId = request.BackgroundFileObjectId,
            Status = "DRAFT",
            CreatedByUserId = _currentUser.UserId,
        };
        _context.CertificateTemplates.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CertificateTemplateResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CertificateTemplateResponse> UpdateTemplateAsync(Guid templateId, UpdateCertificateTemplateRequest request)
    {
        var template = await _context.CertificateTemplates.FindAsync(templateId)
            ?? throw new KeyNotFoundException("Certificate template not found.");

        if (request.Name != null) template.Name = request.Name;
        if (request.TemplateHtml != null) template.TemplateHtml = request.TemplateHtml;
        if (request.Status != null) template.Status = request.Status;
        if (request.BackgroundFileObjectId != null) template.BackgroundFileObjectId = request.BackgroundFileObjectId;
        await _context.SaveChangesAsync(default);

        return new CertificateTemplateResponse
        {
            Id = template.Id,
            Name = template.Name,
            Status = template.Status,
            CreatedAt = template.CreatedAt,
        };
    }

    public async Task ChangeTemplateStatusAsync(Guid templateId, string status)
    {
        var template = await _context.CertificateTemplates.FindAsync(templateId)
            ?? throw new KeyNotFoundException("Certificate template not found.");

        if (status != "DRAFT" && status != "ACTIVE" && status != "ARCHIVED")
            throw new InvalidOperationException("Status must be DRAFT, ACTIVE, or ARCHIVED.");

        template.Status = status;
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════════
    // Certificates
    // ═══════════════════════════════════════

    public async Task<PagedList<CertificateResponse>> SearchCertificatesAsync(PaginationRequest request)
    {
        var query = _context.Certificates
            .Include(c => c.Employee)
            .Include(c => c.Course)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(c => c.CertificateCode.ToLower().Contains(kw)
                                  || c.Employee.FullName.ToLower().Contains(kw)
                                  || c.Course.Title.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.IssuedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CertificateResponse
            {
                Id = c.Id,
                EmployeeId = c.EmployeeId,
                EmployeeName = c.Employee.FullName,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                CertificateCode = c.CertificateCode,
                Status = c.Status,
                IssuedAt = c.IssuedAt,
                ExpiresAt = c.ExpiresAt,
            })
            .ToListAsync();

        return new PagedList<CertificateResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<CertificateDetailResponse> GetCertificateAsync(Guid certificateId)
    {
        var cert = await _context.Certificates
            .Include(c => c.Employee)
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.Id == certificateId)
            ?? throw new KeyNotFoundException("Certificate not found.");

        return MapCertificateDetail(cert);
    }

    public async Task<CertificateDetailResponse> IssueCertificateAsync(IssueCertificateRequest request)
    {
        var employee = await _context.Employees.FindAsync(request.EmployeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        var course = await _context.Courses.FindAsync(request.CourseId)
            ?? throw new KeyNotFoundException("Course not found.");

        var template = await _context.CertificateTemplates.FindAsync(request.CertificateTemplateId)
            ?? throw new KeyNotFoundException("Certificate template not found.");

        // Generate certificate code: CERT-YYYYMMDD-XXXXXX
        var code = $"CERT-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var entity = new Domain.Entities.Certificate.Certificate
        {
            EmployeeId = request.EmployeeId,
            CourseId = request.CourseId,
            AssessmentAttemptId = request.AssessmentAttemptId,
            CertificateTemplateId = request.CertificateTemplateId,
            CertificateCode = code,
            QrUrl = string.Empty, // Will be generated later
            Status = "VALID",
            IssuedAt = DateTimeOffset.UtcNow,
            ExpiresAt = null,
        };
        _context.Certificates.Add(entity);
        await _context.SaveChangesAsync(default);

        // Audit: log certificate issue
        await _auditLog.LogAsync(
            action: "CERTIFICATE_ISSUED",
            entityType: "Certificate",
            entityId: entity.Id,
            newValuesJson: $"EmployeeId={request.EmployeeId}, CourseId={request.CourseId}, Code={code}");

        // SignalR: notify employee about the new certificate
        try
        {
            var empUser = await _context.Employees
                .Where(e => e.Id == request.EmployeeId)
                .Select(e => e.UserId)
                .FirstOrDefaultAsync();
            if (empUser.HasValue)
            {
                await _notificationHub.SendCertificateIssued(empUser.Value, new
                {
                    entity.Id,
                    entity.CertificateCode,
                    entity.Status,
                    CourseTitle = course.Title,
                    entity.IssuedAt
                });
            }
        }
        catch { /* SignalR non-critical */ }

        return new CertificateDetailResponse
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = employee.FullName,
            CourseId = entity.CourseId,
            CourseTitle = course.Title,
            CertificateCode = entity.CertificateCode,
            Status = entity.Status,
            IssuedAt = entity.IssuedAt,
            ExpiresAt = entity.ExpiresAt,
            QrUrl = entity.QrUrl,
            AssessmentAttemptId = entity.AssessmentAttemptId,
        };
    }

    public async Task RevokeCertificateAsync(Guid certificateId, string reason)
    {
        var cert = await _context.Certificates.FindAsync(certificateId)
            ?? throw new KeyNotFoundException("Certificate not found.");

        if (cert.Status != "VALID")
            throw new InvalidOperationException("Only VALID certificates can be revoked.");

        cert.Status = "REVOKED";
        cert.RevokedAt = DateTimeOffset.UtcNow;
        cert.RevokedReason = reason;
        await _context.SaveChangesAsync(default);

        // Audit: log certificate revocation
        await _auditLog.LogAsync(
            action: "CERTIFICATE_REVOKED",
            entityType: "Certificate",
            entityId: certificateId,
            newValuesJson: $"Reason={reason}, Code={cert.CertificateCode}");
    }

    // ═══════════════════════════════════════
    // My Certificates
    // ═══════════════════════════════════════

    public async Task<PagedList<MyCertificateResponse>> GetMyCertificatesAsync(PaginationRequest request)
    {
        if (!_currentUser.EmployeeId.HasValue)
            throw new InvalidOperationException("Authenticated user has no linked employee profile.");

        var query = _context.Certificates
            .Include(c => c.Course)
            .Where(c => c.EmployeeId == _currentUser.EmployeeId.Value);

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.IssuedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new MyCertificateResponse
            {
                Id = c.Id,
                CertificateCode = c.CertificateCode,
                CourseTitle = c.Course.Title,
                Status = c.Status,
                IssuedAt = c.IssuedAt,
                ExpiresAt = c.ExpiresAt,
            })
            .ToListAsync();

        return new PagedList<MyCertificateResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<CertificateDetailResponse> RenewCertificateAsync(Guid certificateId, RenewCertificateRequest request)
    {
        var cert = await _context.Certificates
            .Include(c => c.Employee)
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.Id == certificateId)
            ?? throw new KeyNotFoundException("Certificate not found.");

        cert.Status = "VALID";
        cert.RevokedAt = null;
        cert.RevokedReason = null;
        cert.ExpiresAt = request.NewExpiryDate ?? DateTimeOffset.UtcNow.AddMonths(12);
        if (request.AssessmentAttemptId.HasValue)
            cert.AssessmentAttemptId = request.AssessmentAttemptId;

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            action: "CERTIFICATE_RENEWED",
            entityType: "Certificate",
            entityId: certificateId);

        return MapCertificateDetail(cert);
    }

    // ═══════════════════════════════════════
    // Certificate Verification
    // ═══════════════════════════════════════

    public async Task<CertificateVerificationResponse> VerifyCertificateAsync(string certificateCode)
    {
        var cert = await _context.Certificates
            .Include(c => c.Employee)
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.CertificateCode == certificateCode);

        // Log verification attempt
        _context.CertificateVerificationLogs.Add(
            new Domain.Entities.Certificate.CertificateVerificationLog
            {
                CertificateId = cert?.Id,
                CertificateCode = certificateCode,
                VerifiedAt = DateTimeOffset.UtcNow,
                ResultStatus = cert?.Status ?? "NOT_FOUND",
            });
        await _context.SaveChangesAsync(default);

        if (cert == null)
        {
            return new CertificateVerificationResponse
            {
                IsValid = false,
                CertificateCode = certificateCode,
                Message = "Certificate not found.",
            };
        }

        if (cert.Status == "REVOKED")
        {
            return new CertificateVerificationResponse
            {
                IsValid = false,
                CertificateCode = certificateCode,
                EmployeeName = cert.Employee.FullName,
                CourseTitle = cert.Course.Title,
                IssuedAt = cert.IssuedAt,
                Message = "Certificate has been revoked.",
            };
        }

        if (cert.Status == "EXPIRED")
        {
            return new CertificateVerificationResponse
            {
                IsValid = false,
                CertificateCode = certificateCode,
                EmployeeName = cert.Employee.FullName,
                CourseTitle = cert.Course.Title,
                IssuedAt = cert.IssuedAt,
                ExpiresAt = cert.ExpiresAt,
                Message = "Certificate has expired.",
            };
        }

        return new CertificateVerificationResponse
        {
            IsValid = true,
            CertificateCode = certificateCode,
            EmployeeName = cert.Employee.FullName,
            CourseTitle = cert.Course.Title,
            IssuedAt = cert.IssuedAt,
            ExpiresAt = cert.ExpiresAt,
            Message = "Certificate is valid.",
        };
    }

    // ═══════════════════════════════════════
    // Private Mappers
    // ═══════════════════════════════════════

    private static CertificateDetailResponse MapCertificateDetail(Domain.Entities.Certificate.Certificate cert)
    {
        return new CertificateDetailResponse
        {
            Id = cert.Id,
            EmployeeId = cert.EmployeeId,
            EmployeeName = cert.Employee.FullName,
            CourseId = cert.CourseId,
            CourseTitle = cert.Course.Title,
            CertificateCode = cert.CertificateCode,
            Status = cert.Status,
            IssuedAt = cert.IssuedAt,
            ExpiresAt = cert.ExpiresAt,
            QrUrl = cert.QrUrl,
            AssessmentAttemptId = cert.AssessmentAttemptId,
            PdfFileObjectId = cert.PdfFileObjectId,
            RevokedAt = cert.RevokedAt,
            RevokedReason = cert.RevokedReason,
        };
    }
}
