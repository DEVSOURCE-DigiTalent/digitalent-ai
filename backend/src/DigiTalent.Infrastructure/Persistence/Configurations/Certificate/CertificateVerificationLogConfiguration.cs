using DigiTalent.Domain.Entities.Certificate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Certificate;

public class CertificateVerificationLogConfiguration : IEntityTypeConfiguration<CertificateVerificationLog>
{
    public void Configure(EntityTypeBuilder<CertificateVerificationLog> builder)
    {
        builder.ToTable("certificate_verification_logs");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.CertificateId).HasColumnName("certificate_id");
        builder.Property(x => x.CertificateCode).HasColumnName("certificate_code").HasMaxLength(120);
        builder.Property(x => x.VerifiedAt).HasColumnName("verified_at").HasColumnType("timestamptz");
        builder.Property(x => x.ResultStatus).HasColumnName("result_status").HasMaxLength(30);
        builder.Property(x => x.VerifierIp).HasColumnName("verifier_ip").HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasColumnName("user_agent").HasColumnType("text");
    }
}
