using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CertificateTemplateConfiguration : IEntityTypeConfiguration<CertificateTemplate>
{
    public void Configure(EntityTypeBuilder<CertificateTemplate> builder)
    {
        builder.ToTable("certificate_templates", table =>
        {
            table.HasCheckConstraint("ck_certificate_templates_version", "version_no > 0");
            table.HasCheckConstraint("ck_certificate_templates_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.VersionNo).HasDefaultValue(1);
        builder.Property(x => x.TemplateHtml).IsRequired();
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("DRAFT");

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<FileObject>().WithMany().HasForeignKey(x => x.BackgroundFileObjectId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.Name, x.VersionNo }, "uq_certificate_templates_org_name_version")
            .IsUnique()
            .HasDatabaseName("uq_certificate_templates_org_name_version");
    }
}
