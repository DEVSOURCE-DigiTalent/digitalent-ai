using System.Security.Cryptography;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// Cấp chứng chỉ khi nhân viên đạt bài FINAL (contract B, BRQ-CER-01, CERT-03):
/// khóa bật certificate_enabled + tổ chức có mẫu chứng chỉ ACTIVE + enrollment chưa có chứng chỉ VALID.
/// Mã chứng chỉ duy nhất, không đổi sau khi cấp; tên người / khóa được chụp lại tại thời điểm cấp.
/// </summary>
public class MyCertificateIssuer
{
    public const string NotificationType = "CERTIFICATE_ISSUED";
    private const string CodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public MyCertificateIssuer(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<Certificate?> IssueAsync(Employee employee, Course course, Enrollment enrollment, AssessmentAttempt attempt, DateTimeOffset now)
    {
        if (!course.CertificateEnabled)
        {
            return null;
        }

        var alreadyIssued = await _context.Certificates.AnyAsync(c =>
            c.EnrollmentId == enrollment.Id && c.Status == Statuses.Certificate.Valid);
        if (alreadyIssued)
        {
            return null;
        }

        var template = await _context.CertificateTemplates
            .AsNoTracking()
            .Where(t => t.OrganizationId == course.OrganizationId && t.Status == Statuses.CertificateTemplate.Active)
            .OrderByDescending(t => t.VersionNo)
            .FirstOrDefaultAsync();
        if (template == null)
        {
            return null;
        }

        var primaryCompetency = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                where teaching.CourseId == course.Id
                orderby teaching.CoverageType == Statuses.CourseCoverageType.Primary descending, teaching.TargetLevel descending, competency.Code
                select new { competency.Code, competency.Name, teaching.TargetLevel })
            .FirstOrDefaultAsync();

        var certificate = new Certificate
        {
            EmployeeId = employee.Id,
            EnrollmentId = enrollment.Id,
            AssessmentAttemptId = attempt.Id,
            CertificateTemplateId = template.Id,
            CertificateCode = await GenerateUniqueCodeAsync(now),
            HolderNameSnapshot = employee.FullName,
            CourseTitleSnapshot = course.Title,
            PrimaryCompetencySnapshot = primaryCompetency == null
                ? null
                : $"{primaryCompetency.Code} {primaryCompetency.Name} — {MyLevelLabels.For(primaryCompetency.TargetLevel)}",
            IssuedAt = now,
            ExpiresAt = course.CertificateValidityDays is { } days ? now.AddDays(days) : null,
            Status = Statuses.Certificate.Valid,
        };
        _context.Certificates.Add(certificate);

        if (employee.UserId is { } userId)
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = userId,
                Type = NotificationType,
                Title = "Bạn vừa được cấp chứng chỉ",
                Message = $"Chúc mừng! Bạn đã hoàn thành khóa \"{course.Title}\" và được cấp chứng chỉ {certificate.CertificateCode}.",
                RelatedEntityType = "certificates",
                RelatedEntityId = certificate.Id,
            });
        }

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "CERTIFICATE_ISSUED",
            "certificates",
            certificate.Id,
            newValues: new { certificate.CertificateCode, certificate.EmployeeId, CourseId = course.Id, AttemptId = attempt.Id, attempt.Score });

        return certificate;
    }

    private async Task<string> GenerateUniqueCodeAsync(DateTimeOffset now)
    {
        for (var i = 0; i < 5; i++)
        {
            var suffix = new string(Enumerable.Range(0, 8)
                .Select(_ => CodeAlphabet[RandomNumberGenerator.GetInt32(CodeAlphabet.Length)])
                .ToArray());
            var code = $"DT-{now:yyyy}-{suffix}";
            if (!await _context.Certificates.AnyAsync(c => c.CertificateCode == code))
            {
                return code;
            }
        }

        throw new InvalidOperationException("Could not generate a unique certificate code.");
    }
}
