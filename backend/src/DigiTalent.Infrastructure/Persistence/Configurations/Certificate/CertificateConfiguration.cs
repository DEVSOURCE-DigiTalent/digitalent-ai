using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Certificate;

public class CertificateConfiguration : IEntityTypeConfiguration<Domain.Entities.Certificate.Certificate>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Certificate.Certificate> builder)
    {
        builder.ToTable("certificates");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.CourseId).HasColumnName("course_id");
        builder.Property(x => x.AssessmentAttemptId).HasColumnName("assessment_attempt_id");
        builder.Property(x => x.CertificateTemplateId).HasColumnName("certificate_template_id");
        builder.Property(x => x.CertificateCode).HasColumnName("certificate_code").HasMaxLength(120);
        builder.Property(x => x.QrUrl).HasColumnName("qr_url").HasColumnType("text");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
        builder.Property(x => x.IssuedAt).HasColumnName("issued_at").HasColumnType("timestamptz");
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").HasColumnType("timestamptz");
        builder.Property(x => x.RevokedAt).HasColumnName("revoked_at").HasColumnType("timestamptz");
        builder.Property(x => x.RevokedReason).HasColumnName("revoked_reason").HasColumnType("text");
        builder.Property(x => x.PdfFileObjectId).HasColumnName("pdf_file_object_id");

        builder.HasIndex(x => x.CertificateCode)
            .IsUnique()
            .HasDatabaseName("ux_certificates_code");

        builder.HasIndex(x => new { x.EmployeeId, x.Status })
            .HasDatabaseName("ix_cert_employee_status");

        builder.HasIndex(x => x.ExpiresAt)
            .HasDatabaseName("ix_certificates_expires_at");

        builder.HasOne(c => c.CertificateTemplate)
            .WithMany()
            .HasForeignKey(c => c.CertificateTemplateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
