using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Certificate với bảng "certificates". Mã chứng chỉ duy nhất, mỗi lần làm bài cấp tối đa 1 chứng chỉ;
/// tên người / khóa được chụp lại tại thời điểm cấp.
/// </summary>
public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.ToTable("certificates", table =>
        {
            table.HasCheckConstraint("ck_certificates_status", "status IN ('VALID','EXPIRED','REVOKED')");
            table.HasCheckConstraint("ck_certificates_expiry", "expires_at IS NULL OR expires_at >= issued_at");
            table.HasCheckConstraint(
                "ck_certificates_revocation_fields",
                "status <> 'REVOKED' OR (revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL AND revocation_reason IS NOT NULL)");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CertificateCode).IsRequired().HasMaxLength(100);
        builder.Property(x => x.HolderNameSnapshot).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CourseTitleSnapshot).IsRequired().HasMaxLength(250);
        builder.Property(x => x.PrimaryCompetencySnapshot).HasMaxLength(250);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("VALID");

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId);
        builder.HasOne<AssessmentAttempt>().WithMany().HasForeignKey(x => x.AssessmentAttemptId);
        builder.HasOne<CertificateTemplate>().WithMany().HasForeignKey(x => x.CertificateTemplateId);
        builder.HasOne<FileObject>().WithMany().HasForeignKey(x => x.PdfFileObjectId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.RevokedByUserId);

        builder.HasIndex(x => x.AssessmentAttemptId).IsUnique();
        builder.HasIndex(x => x.CertificateCode).IsUnique();
        builder.HasIndex(x => new { x.EmployeeId, x.IssuedAt }, "ix_certificates_employee")
            .IsDescending(false, true)
            .HasDatabaseName("ix_certificates_employee");
    }
}
